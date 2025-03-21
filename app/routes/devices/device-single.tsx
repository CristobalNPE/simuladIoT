import type {Route} from "./+types/device-single";
import {sensorService} from "~/routes/devices/services/sensor.service";
import {SectionHeader} from "~/components/section-header";
import React from "react";
import {isRouteErrorResponse} from "react-router";
import {DeviceCard} from "~/routes/devices/components/device-card";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import {DeviceCardWithHistory} from "~/routes/devices/components/device-card-full";
import { Badge } from "~/components/ui/badge";
import type {Message} from "~/routes/devices/schemas/message.schema";

export async function clientLoader({params}: Route.ClientLoaderArgs) {
    const mockMessages:Message[] = [
        {
            id: "msg1",
            timestamp: "2023-03-19T13:15:20.351Z",
            request: {
                api_key: "API_KEY_SIN_DEFINIR",
                json_data: [
                    {
                        temperature: 26.4,
                        humidity: 62.7,
                        timestamp: "2023-03-19T13:15:13.351Z",
                    },
                ],
            },
            response: {
                status: 200,
                message: "Data received successfully",
                timestamp: "2023-03-19T13:15:20.451Z",
            },
        },
        {
            id: "msg2",
            timestamp: "2023-03-19T13:15:30.351Z",
            request: {
                api_key: "API_KEY_SIN_DEFINIR",
                json_data: [
                    {
                        temperature: 26.8,
                        humidity: 61.9,
                        timestamp: "2023-03-19T13:15:28.351Z",
                    },
                ],
            },
            response: {
                status: 200,
                message: "Data received successfully",
                timestamp: "2023-03-19T13:15:30.451Z",
            },
        },
        {
            id: "msg3",
            timestamp: "2023-03-19T13:15:40.351Z",
            request: {
                api_key: "API_KEY_SIN_DEFINIR",
                json_data: [
                    {
                        temperature: 27.1,
                        humidity: 61.2,
                        timestamp: "2023-03-19T13:15:38.351Z",
                    },
                ],
            },
            response: {
                status: 400,
                message: "Invalid API key",
                timestamp: "2023-03-19T13:15:40.451Z",
            },
        },
    ]
    const sensor = sensorService.getSensorById(params.deviceId);


    if (!sensor) {
        throw new Error("Dispositivo no encontrado con ID: " + params.deviceId);
    }

    const connectionStrings = connectionStorageService.getCurrentConnectionStrings();
    return {sensor, connectionStrings,messages:mockMessages};

}

export default function DeviceSingle({loaderData}: Route.ComponentProps) {

    const {sensor,connectionStrings,messages} = loaderData;

    return (
        <div className={"col-span-3  bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm"}>
            <div className={"flex justify-between items-center gap-6"}>
                <SectionHeader
                title={sensor.name}
                description={`Detalles del dispositivo simulado ${sensor.name}`}
            />
            <Badge className={"text-sm"} variant={"secondary"}>
                Dispositivo <span className={"font-black"}>{sensor.type === "ESP32" ? "HTTP" : "MQTT"}</span>
            </Badge>
            </div>
            <DeviceCardWithHistory
                sensor={sensor}
                messages={messages}
                connectionStrings={connectionStrings}/>

        </div>
    )
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
    let message = "Oops!";
    let details = "An unexpected error occurred.";
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? "404" : "Error";
        details =
            error.status === 404
                ? "The requested page could not be found."
                : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
            )}
        </main>
    );
}