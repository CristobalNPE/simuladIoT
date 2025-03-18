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

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Simulador Dispositivos IOT"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

export default function Home() {

    const {connectionConfig, getRestEndpoint} = useConnection();

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
        setMessageHistory([{...deviceInfo, timestamp: new Date()}, ...messageHistory].slice(0, 100))

        if (deviceInfo.status) {
            setLastResponse({
                status: deviceInfo.status,
                message: deviceInfo.status >= 200 && deviceInfo.status < 300
                    ? "La ultima solicitud fue completada exitosamente."
                    : "Error"
            })
        }
    }

    return (
        <>
            <header className={"flex items-center justify-between p-4 border-b border-border shadow-xs"}>
                <div className={"container mx-auto flex items-center gap-4 justify-between"}>
                    <div>
                        <h1 className={"text-lg font-semibold"}>Simulador Dispositivos IOT</h1>
                        <p className={"text-xs text-muted-foreground "}>
                            Prueba tu API con dispositivos ESP32 y Zigbee simulados. Configura y envía datos a tu
                            servidor.
                        </p>
                    </div>
                    <ThemeSwitch/>
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

