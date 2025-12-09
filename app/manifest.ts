import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WrestleWell",
    short_name: "WrestleWell",
    description:
      "Training, mindset, WrestleIQ quizzes, goals, and tools for wrestlers, parents, and coaches.",
    start_url: "/",
    display: "standalone",
    background_color: "#020617", // slate-950-ish
    theme_color: "#020617",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}