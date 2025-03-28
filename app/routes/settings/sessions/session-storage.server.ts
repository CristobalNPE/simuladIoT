import {createCookie} from "react-router";
import {createFileSessionStorage} from "@react-router/node";

const sessionCookie = createCookie("__session", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: process.env.SESSION_SECRET.split(','),
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
})

export const {getSession, commitSession, destroySession} = createFileSessionStorage({
    dir: "./sessions",
    cookie: sessionCookie,
})