import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Real sensors POST a JSON body and an X-Signature header containing
// HMAC-SHA256(body, SENSOR_WEBHOOK_SECRET) as a hex string.
const SensorPayload = z.object({
  reading_time: z.string().datetime().optional(),
  source: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_\-:.]+$/),
  total_flow: z.number().min(0).max(1_000_000),
  eflow: z.number().min(0).max(1_000_000),
  temp: z.number().min(-10).max(60).optional().nullable(),
  do_mgl: z.number().min(0).max(30).optional().nullable(),
  sediment_pct: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  if (ab.length === 0 || ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export const Route = createFileRoute("/api/public/sensor-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.SENSOR_WEBHOOK_SECRET;
        if (!secret) {
          return Response.json({ error: "Webhook not configured" }, { status: 503 });
        }
        const signature = request.headers.get("x-signature") ?? "";
        const body = await request.text();
        const expected = createHmac("sha256", secret).update(body).digest("hex");
        if (!safeEqualHex(signature, expected)) {
          return Response.json({ error: "Invalid signature" }, { status: 401 });
        }

        let payload: unknown;
        try { payload = JSON.parse(body); }
        catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
        const parsed = SensorPayload.safeParse(payload);
        if (!parsed.success) {
          return Response.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });
        }
        const p = parsed.data;
        const ratio = p.total_flow > 0 ? +(p.eflow / p.total_flow * 100).toFixed(2) : 0;
        const ps4 = ratio >= 10 ? "PASS" : "FAIL";
        const ps6 = (p.do_mgl ?? 0) >= 5 ? "PASS" : "FAIL";

        const { data, error } = await supabaseAdmin
          .from("sensor_readings")
          .insert({
            reading_time: p.reading_time ?? new Date().toISOString(),
            source: p.source,
            total_flow: p.total_flow,
            eflow: p.eflow,
            ratio,
            temp: p.temp ?? null,
            do_mgl: p.do_mgl ?? null,
            sediment_pct: p.sediment_pct ?? null,
            ps4_status: ps4,
            ps6_status: ps6,
            notes: p.notes ?? null,
          })
          .select()
          .single();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ data }, { status: 201 });
      },
    },
  },
});
