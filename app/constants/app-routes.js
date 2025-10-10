export const APP_ROUTES = {
  DASHBOARD: "/dashboard",
  PROCESSING: "/processing",
  DOCUMENTATION: "/documentation",
  LOGIN: "/login",
  PROCESSING: {
    NEW: "/processing/new",
    TRACE: "/processing/trace",
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
