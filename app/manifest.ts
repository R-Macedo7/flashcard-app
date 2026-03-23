import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portuguese Flashcards",
    short_name: "PT Flashcards",
    description: "Learn European Portuguese with flashcards and quiz mode.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f6",
    theme_color: "#7c3aed",
    orientation: "portrait",
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