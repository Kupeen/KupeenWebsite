import netlify from "@netlify/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The Netlify plugin runs the functions in netlify/functions/ inside `npm run dev`, so /api/… works locally too.
// The site uses no Edge Functions and no Netlify Database, so their local emulators stay off.
export default defineConfig({
  plugins: [react(), netlify({ edgeFunctions: { enabled: false }, database: { enabled: false } })],
});
