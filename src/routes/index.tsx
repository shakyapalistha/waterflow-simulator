import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HydroFlow — IFC PS E-Flow Compliance Simulator" },
      {
        name: "description",
        content:
          "HydroFlow simulates IFC Performance Standards PS4, PS6 and PS8 environmental flow compliance for Nepal hydropower projects.",
      },
      { property: "og:title", content: "HydroFlow — IFC PS E-Flow Compliance Simulator" },
      {
        property: "og:description",
        content:
          "Real-time environmental flow, biodiversity and cultural heritage compliance monitoring for run-of-river hydropower.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/hydroflow.html"
      title="IFC PS E-Flow Compliance Simulator"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        border: 0,
        background: "#ffffff",
      }}
    />
  );
}
