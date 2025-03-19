import type {Route} from "./+types/home";
import {ThemeSwitch} from "~/components/theme-switch";
import React, {useState} from "react";
import {ConfigurationCard} from "~/components/conn-configuration-card";
import {useConnection} from "~/context/connection-context";
import {DevicePanel} from "~/components/device-panel";
import {StatusCard} from "~/components/status-card";
import {MessageHistoryCard} from "~/components/message-history-card";
import type {DeviceInfo, DeviceInfoWithTimestamp, DeviceType} from "~/types/device.types";
import type {ConnectionConfig} from "~/types/connection.types";
import {ExternalLink, Github} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "SimulaDIoT - Simulador Dispositivos de IOT"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

export default function Home() {

    const {connectionConfig} = useConnection();

    const [lastResponse, setLastResponse] = useState<{ status: number; message: string } | null>(null)
    const [messageHistory, setMessageHistory] = useState<DeviceInfoWithTimestamp[]>([])

    const [activeDevices, setActiveDevices] = useState<string[]>([])
    const [deviceConfigs, setDeviceConfigs] = useState<Record<string, ConnectionConfig>>({});


    const addDevice = (deviceType: DeviceType) => {
        const deviceId = `${deviceType}-${Date.now()}`
        const deviceConnectionConfig = JSON.parse(JSON.stringify(connectionConfig));

        setActiveDevices([...activeDevices, deviceId])
        setDeviceConfigs(prev => ({
                ...prev,
                [deviceId]: deviceConnectionConfig
            }
        ))
    }

    const removeDevice = (deviceId: string) => {
        setActiveDevices(activeDevices.filter((id) => id !== deviceId))
    }

    const handleMessageSent = (deviceInfo: DeviceInfo) => {
        setMessageHistory(prevHistory =>
            [{...deviceInfo, timestamp: new Date()}, ...prevHistory].slice(0, 100)
        );

        if (deviceInfo.status !== undefined) {
            setLastResponse({
                status: deviceInfo.status,
                message: deviceInfo.message || deviceInfo.errorDetails || (
                    deviceInfo.status >= 200 && deviceInfo.status < 300
                        ? "La última solicitud fue completada exitosamente."
                        : "Error desconocido"
                )
            });
        }
    }



    return (
        <>
            <header className={"flex items-center justify-between p-4 border-b border-border shadow-xs"}>
                <div className={"container mx-auto flex items-center gap-4 justify-between"}>
                    <div>
                        <h1 className={"text-lg font-semibold"}>SimulaDIoT - Simulador de Dispositivos IOT</h1>
                        <p className={"text-xs text-muted-foreground "}>
                            Prueba tu API con dispositivos ESP32 y Zigbee simulados. Configura y envía datos a tu
                            servidor.
                        </p>
                    </div>
                    <div className={"flex items-center gap-4"}>
                        <GithubLink/>
                        <ThemeSwitch/>
                    </div>
                </div>
            </header>

            <main className={"py-4 container mx-auto space-y-6"}>
                <div className={"grid gap-6 lg:grid-cols-2"}>
                    <div className={"space-y-6"}>
                        <ConfigurationCard addDevice={addDevice}/>
                        <StatusCard lastResponse={lastResponse}/>
                    </div>
                    <MessageHistoryCard
                        messageHistory={messageHistory}
                        setMessageHistory={setMessageHistory}
                    />
                </div>
                <div className={"grid lg:grid-cols-3 gap-6"}>
                    {activeDevices.map((deviceId) => (
                        <DevicePanel
                            key={deviceId}
                            deviceId={deviceId}
                            deviceType={deviceId.split("-")[0] as DeviceType}
                            connectionConfig={deviceConfigs[deviceId]}
                            onRemove={() => removeDevice(deviceId)}
                            onMessageSent={handleMessageSent}
                        />
                    ))}
                </div>
            </main>
        </>
    );
}

function GithubLink() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>

                <div className={" h-8 w-fit flex justify-center items-center p-2 rounded-full border"}>
                    <a
                        href="https://github.com/CristobalNPE/iot-device-simulator" target="_blank"
                        rel="noreferrer">
                        <Github size={20}/>
                    </a>
                </div>


            </TooltipTrigger>
            <TooltipContent>
                <p>Ver en GitHub <ExternalLink size={14} className={"inline-flex ml-1"}/></p>
            </TooltipContent>
        </Tooltip>
    )
}
