import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss()],
  build: isSsrBuild
    ? // The server entry only exists to pre-render index.html; its
      // dependencies stay external, so there is nothing to split.
      {}
    : {
        // Split long-lived vendor code out of the app bundle so a content change
        // doesn't invalidate React or the animation runtime in a visitor's cache.
        rollupOptions: {
          output: {
            manualChunks: {
              react: ["react", "react-dom"],
              motion: ["framer-motion"],
            },
          },
        },
      },
}));
