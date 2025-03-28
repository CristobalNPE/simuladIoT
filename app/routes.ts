import {index, layout, route, type RouteConfig} from "@react-router/dev/routes";

export default [

    //actions
    route("/action/set-theme", "routes/api/action.set-theme.ts"),
    route("send-to-broker", "routes/api/action.send-message-to-broker.ts"),
    route("api/trigger-auto-send", "routes/api/action.trigger-auto-send.ts"),
    route("api/test-connection", "routes/api/action.test-connection.ts"),

    index("routes/home.tsx"),

    layout("routes/layout.tsx", [
        route("devices", "routes/devices/devices.tsx"),
        route(":deviceId", "routes/devices/device-single.tsx"),
        route("settings", "routes/settings/settings.tsx"),
    ]),



] satisfies RouteConfig;
