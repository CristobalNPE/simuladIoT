import type {Route} from "./+types/device-single";
import {sensorService} from "~/routes/devices/services/sensor.service";
import {SectionHeader} from "~/components/section-header";
import React, {useEffect, useState} from "react";
import {isRouteErrorResponse, redirect} from "react-router";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import {DeviceCardWithHistory} from "~/routes/devices/components/device-card-full";
import {Badge} from "~/components/ui/badge";
import {messageHistoryService} from "~/routes/devices/services/message-history.service";
import type {Message} from "~/routes/devices/schemas/message.schema";


export function meta({matches}: Route.MetaArgs) {

    const {sensor} = matches[2].data;

    return [
        {title: `Detalles - ${sensor.name}`},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

export async function clientLoader({params}: Route.ClientLoaderArgs) {

    const sensor = sensorService.getSensorById(params.deviceId);

    if (!sensor) {
        throw redirect("/settings");
    }

    // const messages = messageHistoryService.getMessageHistoryBySensorId(sensor.id);
    const connectionStrings = connectionStorageService.getCurrentConnectionStrings();

    return {
        sensor,
        connectionStrings,
        // messages
    };
}

export default function DeviceSingle({loaderData}: Route.ComponentProps) {

    const {sensor, connectionStrings} = loaderData;

    const [messages, setMessages] = useState<Message[]>([]);

    const refreshMessages = () => {
        setMessages(messageHistoryService.getMessageHistoryBySensorId(sensor.id));
    }

    useEffect(() => {
        refreshMessages();
        const intervalId = setInterval(refreshMessages, 1000);
        return () => clearInterval(intervalId);
    }, [sensor.id]);


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