import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoltEdge EV — Futuristic EV Fleet Monitoring" },
      { name: "description", content: "Real-time battery analytics, driver scoring, and predictive maintenance for electric vehicle fleets." },
      { property: "og:title", content: "VoltEdge EV" },
      { property: "og:description", content: "Predictive intelligence for electric fleets." },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/voltedge/index.html");
  }, []);
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#04050b", color: "#00e7ff", fontFamily: "system-ui" }}>
      <p style={{ letterSpacing: 4 }}>LOADING VOLTEDGE…</p>
    </div>
  );
}
