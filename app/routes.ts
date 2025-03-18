import {type RouteConfig, index, route} from "@react-router/dev/routes";

export default [

    route("/action/set-theme", "routes/action.set-theme.ts"),

    index("routes/home.tsx")

] satisfies RouteConfig;
