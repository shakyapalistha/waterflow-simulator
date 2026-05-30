import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IFC PS E-Flow Compliance Monitor — Nepal Hydropower" },
      {
        name: "description",
        content:
          "Live IFC Performance Standard environmental flow compliance dashboard for Nepal hydropower projects.",
      },
      { property: "og:title", content: "IFC PS E-Flow Compliance Monitor" },
      {
        property: "og:description",
        content:
          "Real-time hydrograph, power curve, flow simulation, and IFC compliance monitoring.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/simulator.html"
      title="IFC PS E-Flow Compliance Simulator"
      className="h-screen w-screen border-0"
    />
  );
}
