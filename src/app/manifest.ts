import type { MetadataRoute } from "next";

// PWA manifest — makes Agent HQ installable on the phone home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Agent HQ",
    short_name: "Agent HQ",
    description:
      "Your AI office: live agent status, activity, per-API token usage, and approvals — from your own APIs.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
