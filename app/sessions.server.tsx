import {createThemeSessionResolver} from "remix-themes";
import {createCookieSessionStorage} from "react-router";
import dotenv from "dotenv";

//TODO: move env config someday 🎄

dotenv.config();
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be defined in environment variables");
}

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__iot-web-theme",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secrets: process.env.SESSION_SECRET.split(','),
        secure: process.env.NODE_ENV === 'production',
    },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);