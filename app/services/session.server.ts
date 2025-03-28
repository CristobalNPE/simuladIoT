import {createCookie} from "react-router";
import {createFileSessionStorage} from "@react-router/node";
import dotenv from "dotenv";
import {createThemeSessionResolver} from "remix-themes";

//TODO: move env config someday 🎄
dotenv.config();
if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be defined in environment variables");
}

const sessionCookie = createCookie("__session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
})

const sessionStorage = createFileSessionStorage({
    dir: "./sessions",
    cookie: sessionCookie,
})

export const {getSession, commitSession, destroySession} = sessionStorage;
export const themeSessionResolver = createThemeSessionResolver(sessionStorage);