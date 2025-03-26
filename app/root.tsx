import {Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData,} from "react-router";

import type {Route} from "./+types/root";
import "./app.css";
import {themeSessionResolver} from "~/sessions.server";
import {PreventFlashOnWrongTheme, type Theme, ThemeProvider, useTheme} from "remix-themes";
import React from "react";
import {TooltipProvider} from "~/components/ui/tooltip";
import {Toaster} from "sonner";
import {SensorProvider} from "./routes/devices/context/sensor-context";
import {z} from "zod";
import {configureZodErrorMap} from "~/config/zod-config";

export const links: Route.LinksFunction = () => [
    {rel: "preconnect", href: "https://fonts.googleapis.com"},
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    },
];

export async function loader({request}: Route.LoaderArgs) {
    const {getTheme} = await themeSessionResolver(request);

    return {
        theme: getTheme() ?? "light" as Theme,
    }
}

export default function App({loaderData}: Route.ComponentProps) {
    const {theme} = loaderData;


    return (
        <ThemeProvider specifiedTheme={theme} themeAction={"/action/set-theme"}>
            <SensorProvider>
                <TooltipProvider>
                    <Document>
                        <Outlet/>
                    </Document>
                </TooltipProvider>
            </SensorProvider>
        </ThemeProvider>
    );
}


export function Document({children}: { children: React.ReactNode }) {
    const data = useLoaderData<typeof loader>();

    const [theme] = useTheme();
    return (
        <html className={`${theme} `} lang="es">
        <head>
            {/*<script src="https://unpkg.com/react-scan/dist/auto.global.js" />*/}
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)}/>
            <Links/>
        </head>
        <body className={"min-h-[100dvh] w-[100vw] overflow-x-hidden !bg-background"}>
        {children}
        <Toaster/>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

configureZodErrorMap();

// export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
//     let message = "Oops!";
//     let details = "An unexpected error occurred.";
//     let stack: string | undefined;
//
//     if (isRouteErrorResponse(error)) {
//         message = error.status === 404 ? "404" : "Error";
//         details =
//             error.status === 404
//                 ? "The requested page could not be found."
//                 : error.statusText || details;
//     } else if (import.meta.env.DEV && error && error instanceof Error) {
//         details = error.message;
//         stack = error.stack;
//     }
//
//     return (
//         <main className="pt-16 p-4 container mx-auto">
//             <h1>{message}</h1>
//             <p>{details}</p>
//             {stack && (
//                 <pre className="w-full p-4 overflow-x-auto">
//           <code>{stack}</code>
//         </pre>
//             )}
//         </main>
//     );
// }
