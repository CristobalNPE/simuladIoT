import { createThemeSessionResolver } from "remix-themes";
import { createCookieSessionStorage } from "react-router";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__iot-web-theme",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secrets: process.env.VITE_SESSION_SECRET.split(','),
        secure: process.env.NODE_ENV === 'production',
    },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);