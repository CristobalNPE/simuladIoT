import type {Sensor, SensorStatus} from "~/routes/devices/schemas/sensor.schema";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "~/components/ui/card"
import {Button} from "~/components/ui/button"
import {Badge} from "~/components/ui/badge"
import {Activity, Edit, Radio, RefreshCw, Trash2, Wifi} from "lucide-react"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs"
import {useState} from "react";
import {PayloadTab} from "./payload-tab";
import {SettingsTab} from "./settings-tab";
import {UpdateSensorDialog} from "~/routes/devices/components/update-sensor-dialog";
import {href, useFetcher} from "react-router";
import {MessagesTab} from "~/routes/devices/components/messages-tab";
import type {Message} from "~/routes/devices/schemas/message.schema";


export function DeviceCardWithHistory({sensor,messages, connectionStrings}: {
    sensor: Sensor,
    messages: Message[],
    connectionStrings: { http: string, mqtt: string }
}) {

    const fetcher = useFetcher({key: "delete-sensor"})
    const [tab, setTab] = useState("payload")
    const [sensorStatus, setSensorStatus] = useState<SensorStatus>({
        isVariable: false,
        isSending: false
    })

    return (
        <div className="col-span-1 h-[calc(100dvh - 1rem)]">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">

                    <div className={"flex gap-1 items-center justify-between !w-full text-nowrap "}>
                        <div className={"flex gap-1"}>{sensorStatus.isSending && (
                            <Badge variant="outline" className="ml-2 animate-pulse">
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin"/>
                                Enviando automáticamente...
                            </Badge>
                        )}
                            {sensorStatus.isVariable && (
                                <div className={"border flex justify-center items-center p-1 rounded-full"}>
                                    <Activity className={" h-3 w-3 animate-pulse "}/>
                                </div>
                            )}</div>
                    </div>
                </div>

            </div>
            <div className={"flex-1"}>
                <Tabs value={tab} onValueChange={setTab}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="payload">Payload</TabsTrigger>
                        <TabsTrigger value="settings">Ajustes</TabsTrigger>
                        <TabsTrigger value="messages">Mensajes ({messages.length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="payload" className="space-y-4 pt-4">
                        <PayloadTab
                            key={sensor.id}
                            sensorType={sensor.type}
                            sensorId={sensor.id}
                            apiKey={sensor.apiKey}
                            payload={sensor.payload}
                        />

                    </TabsContent>
                    <TabsContent value="settings" className="space-y-4 pt-4">
                        <SettingsTab
                            deviceId={sensor.id}
                            sendingTo={sensor.type === "ESP32" ? connectionStrings.http : connectionStrings.mqtt}
                            sensorStatus={sensorStatus}
                            setSensorStatus={setSensorStatus}
                        />
                        <div className="flex justify-end gap-4">

                            <UpdateSensorDialog sensor={sensor}>
                                <Button variant="outline" >
                                    <Edit className="h-4 w-4"/>
                                    Editar dispositivo
                                </Button>
                            </UpdateSensorDialog>
                            <fetcher.Form action={href("/devices")} method={"POST"}>
                                <input type="hidden" name="sensorId" value={sensor.id}/>
                                <Button type="submit" name={"intent"} value={"delete-sensor"} variant="destructive" >
                                    <Trash2 className="h-4 w-4"/>
                                    Eliminar dispositivo
                                </Button>
                            </fetcher.Form>
                        </div>
                    </TabsContent>
                    <TabsContent value="messages" className="space-y-4 pt-4">
                        <MessagesTab messages={messages}/>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}