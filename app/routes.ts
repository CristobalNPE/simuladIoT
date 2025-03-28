import {index, layout, route, type RouteConfig} from "@react-router/dev/routes";

export default [

    route("/action/set-theme", "routes/action.set-theme.ts"),

    index("routes/home.tsx"),

    layout("routes/layout.tsx", [
        route("devices", "routes/devices/devices.tsx"),
        route(":deviceId", "routes/devices/device-single.tsx"),
        route("settings", "routes/settings/settings.tsx"),
        route("send-to-broker", "routes/send-message-to-broker.tsx"),
    ]),

    route("api/trigger-auto-send", "routes/api/trigger-auto-send.tsx"),
    route("api/test-connection", "routes/api/test-connection.tsx"),

] satisfies RouteConfig;
