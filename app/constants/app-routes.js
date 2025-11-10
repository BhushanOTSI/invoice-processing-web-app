export const APP_ROUTES = {
  DASHBOARD: "/products/invoice-parser/dashboard",
  PROCESSING: "/products/invoice-parser/processing",
  DOCUMENTATION: "/products/invoice-parser/documentation",
  FEATURES: "/features",
  INTEGRATIONS: "/integrations",
  PRICING: "/pricing",
  FAQ: "/faq",
  LOGIN: "/login",
  PROCESSING: {
    NEW: "/products/invoice-parser/processing/new",
    TRACE: "/products/invoice-parser/processing/trace",
    MONITOR_BATCHES: "/products/invoice-parser/processing/trace/batch",
    BATCH: "/products/invoice-parser/processing/trace/batch/[batchID]",
    TRACE_PROCESS: "/products/invoice-parser/processing/trace/[processID]",
  },
  DOCUMENTATION: {
    INTRODUCTION: "/products/invoice-parser/documentation/introduction",
    GET_STARTED: "/products/invoice-parser/documentation/get-started",
    TUTORIALS: "/products/invoice-parser/documentation/tutorials",
    CHANGELOG: "/products/invoice-parser/documentation/changelog",
  },
  getRoute: (route, params = {}) => {
    if (route.includes("[")) {
      return route.replace(/\[(\w+)\]/g, (_, key) => params[key]);
    }

    return route;
  },
};
