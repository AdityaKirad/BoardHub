import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { reactRouterDevTools } from "react-router-devtools";
import netlifyReactRouter from "@netlify/vite-plugin-react-router";

export default defineConfig({
  plugins: [
    reactRouterDevTools(),
    reactRouter(),
    tailwindcss(),
    netlifyReactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    noExternal: ["@atlaskit/pragmatic-drag-and-drop"],
  },
});
