export const APP_ROUTES = {
  DASHBOARD: "/dashboard",
  PROCESSING: "/processing",
  DOCUMENTATION: "/documentation",
  LOGIN: "/login",
  PROCESSING: {
    NEW: "/processing/new",
    TRACE: "/processing/trace",
    BATCH: "/processing/trace/batch/[batchID]",
    TRACE_PROCESS: "/processing/trace/[processID]",
  },
  DOCUMENTATION: {
    INTRODUCTION: "/documentation/introduction",
    GET_STARTED: "/documentation/get-started",
    TUTORIALS: "/documentation/tutorials",
    CHANGELOG: "/documentation/changelog",
  },
  getRoute: (route, params = {}) => {
    if (route.includes("[")) {
      return route.replace(/\[(\w+)\]/g, (_, key) => params[key]);
    }

    return route;
  },
};
