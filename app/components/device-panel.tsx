// components/DevicePanel.tsx
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card"
import {Button} from "~/components/ui/button"
import {Badge} from "~/components/ui/badge"
import {Radio, RefreshCw, Send, Trash2, Wifi} from "lucide-react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs"

import type {ConnectionConfig} from "~/types/connection.types"
import {useConnection} from "~/context/connection-context"
import {useDeviceState} from "~/hooks/useDeviceState";
import {generateSamplePayload} from "~/utils/payload.utils";
import {sendDeviceData} from "~/services/device.service"
import {EditDeviceDialog} from "~/components/edit-device";
import {PayloadTab} from "~/components/payload-tab";
import {SettingsTab} from "~/components/settings-tab";
import type {DeviceInfo, DeviceType} from "~/types/device.types";
import {useState} from "react";


interface DevicePanelProps {
    deviceId: string
    deviceType: DeviceType
    connectionConfig: ConnectionConfig
    onRemove: () => void
    onMessageSent: (deviceInfo: DeviceInfo) => void
}

export function DevicePanel({
                                 deviceId,
                                 deviceType,
                                 connectionConfig,
                                 onRemove,
                                 onMessageSent,
                             }: DevicePanelProps) {
    const {getRestEndpoint, getMqttEndpoint} = useConnection()

    const {
        deviceName,
        setDeviceName,
        sensorApiKey,
        setSensorApiKey,
        sensorCategory,
        setSensorCategory,
        customPayload,
        setCustomPayload,
        intervalTime,
        setIntervalTime,
        isSending,
        setIsSending,
        sendInterval,
        setSendInterval
    } = useDeviceState(deviceId, deviceType)

    // Device-specific handlers
    const handleGenerateSamplePayload = () => {
        const payload = generateSamplePayload(sensorCategory, sensorApiKey)
        setCustomPayload(JSON.stringify(payload, null, 2))
    }

    const handleSendData = async () => {
        const result = await sendDeviceData({
            deviceId,
            payload: customPayload,
            sensorApiKey,
            connectionConfig,
            restEndpoint: getRestEndpoint(),
            mqttEndpoint: getMqttEndpoint()
        })

        onMessageSent({
            deviceType,
            deviceName,
            deviceId,
            message: result.payload,
            status: result.status
        })

        if (result.updatedPayload) {
            setCustomPayload(result.updatedPayload)
        }
    }

    const toggleAutoSend = () => {
        if (sendInterval) {
            clearInterval(sendInterval)
            setSendInterval(null)
            setIsSending(false)
        } else {
            const interval = window.setInterval(() => {
                handleSendData()
            }, intervalTime * 1000)
            setSendInterval(interval as unknown as number)
            setIsSending(true)
        }
    }


    const [tab, setTab] = useState("payload")

    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center">
                        {deviceType === "esp32" ? <Wifi className="mr-2 h-5 w-5"/> : <Radio className="mr-2 h-5 w-5"/>}
                        {deviceName}
                    </CardTitle>
                    <CardDescription>
                        {deviceType === "esp32" ? "Dispositivo HTTP" : "Dispositivo MQTT"}
                        {isSending && (
                            <Badge variant="outline" className="ml-2 animate-pulse">
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin"/>
                                Auto-sending
                            </Badge>
                        )}
                    </CardDescription>
                </div>
                <div className="flex space-x-2">
                    <EditDeviceDialog
                        deviceName={deviceName}
                        setDeviceName={setDeviceName}
                        sensorApiKey={sensorApiKey}
                        setSensorApiKey={setSensorApiKey}
                        sensorCategory={sensorCategory}
                        setSensorCategory={setSensorCategory}
                        generateSamplePayload={handleGenerateSamplePayload}
                    />
                    <Button variant="outline" size="icon" onClick={onRemove}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className={"flex-1"}>
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="payload">Payload</TabsTrigger>
                        <TabsTrigger value="settings">Ajustes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="payload" className="space-y-4 pt-4">
                        <PayloadTab
                            deviceId={deviceId}
                            customPayload={customPayload}
                            setCustomPayload={setCustomPayload}
                        />
                    </TabsContent>
                    <TabsContent value="settings" className="space-y-4 pt-4">
                        <SettingsTab
                            deviceId={deviceId}
                            deviceType={deviceType}
                            intervalTime={intervalTime}
                            setIntervalTime={setIntervalTime}
                            isSending={isSending}
                            toggleAutoSend={toggleAutoSend}
                            restEndpoint={getRestEndpoint()}
                            mqttEndpoint={getMqttEndpoint()}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between gap-1">
                {
                    tab === "payload" && <>
                        <Button variant="outline" onClick={handleGenerateSamplePayload}>
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Regenerar
                        </Button>
                        <Button onClick={handleSendData}>
                            <Send className="mr-2 h-4 w-4"/>
                            Enviar Datos
                        </Button>
                    </>
                }
            </CardFooter>
        </Card>
    )
}