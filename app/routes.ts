import type { RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "remix-flat-routes";
import { remixRoutesOptionAdapter } from "@react-router/remix-routes-option-adapter";

export default remixRoutesOptionAdapter((defineRoutes) =>
  flatRoutes("routes", defineRoutes, {
    ignoredRouteFiles: [
      ".*",
      "**/*.css",
      "**/+*.*",
      "**/*.server.*",
      "**/*.client.*",
    ],
  }),
) satisfies RouteConfig;
