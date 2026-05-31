import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ReadingSchema = z.object({
  reading_time: z.string().datetime().optional(),
  source: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_\-:.]+$/).default("simulated"),
  total_flow: z.number().min(0).max(1_000_000),
  eflow: z.number().min(0).max(1_000_000),
  ratio: z.number().min(0).max(100),
  temp: z.number().min(-10).max(60).optional().nullable(),
  do_mgl: z.number().min(0).max(30).optional().nullable(),
  sediment_pct: z.number().min(0).max(100).optional().nullable(),
  ps4_status: z.string().min(1).max(32).optional().nullable(),
  ps6_status: z.string().min(1).max(32).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export const Route = createFileRoute("/api/readings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 50), 1), 200);
        const { data, error } = await supabaseAdmin
          .from("sensor_readings")
          .select("*")
          .order("reading_time", { ascending: false })
          .limit(limit);
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ data });
      },
      POST: async ({ request }) => {
        let payload: unknown;
        try { payload = await request.json(); }
        catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
        const parsed = ReadingSchema.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
        }
        const row = { ...parsed.data, reading_time: parsed.data.reading_time ?? new Date().toISOString() };
        const { data, error } = await supabaseAdmin
          .from("sensor_readings")
          .insert(row)
          .select()
          .single();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ data }, { status: 201 });
      },
    },
  },
});
