import type {Sensor} from "~/routes/devices/schemas/sensor.schema";
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
import {useSensor} from "~/routes/devices/context/sensor-context";


export function DeviceCard({sensor, connectionStrings}: {
    sensor: Sensor,
    connectionStrings: { http: string, mqtt: string }
}) {

    const fetcher = useFetcher({key: "delete-sensor"})
    const [tab, setTab] = useState("payload")

    const {sensorStatus} = useSensor(sensor.id);

    return (
        <Card className="col-span-1 h-[30.5rem]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="flex items-center">
                        {sensor.type === "ESP32" ? <Wifi className="mr-2 h-5 w-5"/> : <Radio className="mr-2 h-5 w-5"/>}
                        {sensor.name}
                    </CardTitle>
                    <CardDescription className={"flex gap-1 items-center justify-between !w-full text-nowrap "}>
                        {sensor.type === "ESP32" ? "Dispositivo HTTP" : "Dispositivo MQTT"}
                        <div className={"flex gap-1"}>{sensorStatus.isSending && (
                            <Badge variant="outline" className="ml-2 animate-pulse">
                                <RefreshCw className="mr-1 h-3 w-3 animate-spin"/>
                                Auto...
                            </Badge>
                        )}
                            {sensorStatus.isVariable && (
                                <div className={"border flex justify-center items-center p-1 rounded-full"}>
                                    <Activity className={" h-3 w-3 animate-pulse "}/>
                                </div>
                            )}</div>
                    </CardDescription>
                </div>
                <div className="flex space-x-2">

                    <UpdateSensorDialog sensor={sensor}>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4"/>
                        </Button>
                    </UpdateSensorDialog>
                    <fetcher.Form action={href("/devices")} method={"POST"}>
                        <input type="hidden" name="sensorId" value={sensor.id}/>
                        <Button type="submit" name={"intent"} value={"delete-sensor"} variant="outline" size="icon">
                            <Trash2 className="h-4 w-4"/>
                        </Button>
                    </fetcher.Form>
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
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}