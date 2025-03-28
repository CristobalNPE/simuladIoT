import type {Route} from "./+types/device-single";
import {SectionHeader} from "~/components/section-header";
import React, {useCallback, useEffect, useState} from "react";
import {redirect} from "react-router";
import {DeviceCardWithHistory} from "~/routes/devices/components/device-card-full";
import {Badge} from "~/components/ui/badge";
import {messageHistoryService} from "~/routes/devices/services/message-history.service";
import type {Message} from "~/routes/devices/schemas/message.schema";
import {sensorSessionService} from "~/routes/devices/services/sensor-session.server";


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

    const sensor = await sensorSessionService.getSensorById(request, params.deviceId);

    if (!sensor) {
        throw redirect("/settings");
    }

    return {
        sensor,
    };
}

export default function DeviceSingle({loaderData}: Route.ComponentProps) {

    const {sensor} = loaderData;

    const [messages, setMessages] = useState<Message[]>([]);

    const refreshMessages = useCallback(() => {
        const newMessages = messageHistoryService.getMessageHistoryBySensorId(sensor.id);
        setMessages(prevMessages => {
            if (JSON.stringify(newMessages) !== JSON.stringify(prevMessages)) {
                return newMessages;
            }
            return prevMessages;
        });
    }, [sensor.id]);

    useEffect(() => {
        refreshMessages();
        const intervalId = setInterval(refreshMessages, 1000);
        return () => clearInterval(intervalId);
    }, [sensor.id, refreshMessages]);


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
                messages={messages}
            />

        </div>
    )
}

