import type {Route} from "./+types/device-single";
import {SectionHeader} from "~/components/section-header";
import React, {useEffect} from "react";
import {DeviceCardWithHistory} from "~/routes/devices/components/device-card-full";
import {Badge} from "~/components/ui/badge";
import {sensorSessionService} from "~/routes/devices/services/sensor-session.server";
import {messageHistoryService} from "~/routes/devices/services/message-history.server";
import {href, redirect, useRevalidator} from "react-router";


export function meta({matches}: Route.MetaArgs) {
    const sensor = matches[2]?.data?.sensor;

    if (!sensor) {
        return [
            {title: "Device Details"},
            {name: "description", content: "IOT Device Simulator"}
        ];
    }

    return [
        {title: `Detalles - ${sensor.name}`},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

export async function loader({request, params}: Route.LoaderArgs) {
    const sensorId = params.deviceId;
    if (!sensorId) throw new Response("Not Found", {status: 404});

    const [sensor, history] = await Promise.all([
        sensorSessionService.getSensorById(request, sensorId),
        messageHistoryService.getHistoryForSensor(request, sensorId)
    ]);
    if (!sensor) throw redirect(href("/devices"));

    return {sensor, history};
}

export default function DeviceSingle({loaderData}: Route.ComponentProps) {

    const {sensor, history} = loaderData;
    const revalidator = useRevalidator();

    // poll for history updates by revalidating the loader data
    useEffect(() => {
        revalidator.revalidate();

        console.log(`[History Poll] Starting for ${sensor.id}`);
        const intervalId = setInterval(() => {
            console.log(`[History Poll] Revalidating for ${sensor.id}`);
            if (revalidator.state === 'idle') { // only  if not already loading
                revalidator.revalidate();
            }
        }, 3000); // todo: every 3 seconds? (adjust ?)

        return () => {
            console.log(`[History Poll] Stopping for ${sensor.id}`);
            clearInterval(intervalId);
        };
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
                key={`${sensor.id}-${JSON.stringify(sensor.payload)}`}
                sensor={sensor}
                messages={history}
            />

        </div>
    )
}

