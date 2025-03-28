import {createCookieSessionStorage} from "react-router";

const settingsSessionStorage = createCookieSessionStorage({
    cookie: {
        name: "settings-storage",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secrets: process.env.SESSION_SECRET.split(','),
        secure: process.env.NODE_ENV === 'production',
    },
})

export {settingsSessionStorage}