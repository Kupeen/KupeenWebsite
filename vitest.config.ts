import { defineConfig } from "vitest/config";

// Tests run in plain Node, without the Netlify plugin.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "netlify/**/*.test.ts"],
  },
});
