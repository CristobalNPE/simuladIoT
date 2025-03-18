import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {Radio, Unplug, Wifi} from "lucide-react";
import {useConnection} from "~/context/connection-context";
import type {MqttConnection, RestConnection} from "~/types/connection.types";
import React from "react";
import type {DeviceType} from "~/types/device.types";

export function ConfigurationCard(
    {
        addDevice,
    }: {
        addDevice: (deviceType: DeviceType) => void,
    }) {

    const {
        connectionConfig,
        updateRestConnection,
        updateMqttConnection,
        setConnectionType,
        connectionType,
        getRestEndpoint,
        getMqttEndpoint
    } = useConnection();

    const restConfig = connectionType === 'rest' ? connectionConfig as RestConnection : null;
    const mqttConfig = connectionType === 'mqtt' ? connectionConfig as MqttConnection : null;


    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Configuración</CardTitle>
                <CardDescription>Configura los detalles de conexión hacia tu API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
                <Tabs
                    defaultValue={connectionType === "mqtt" ? "mqtt" : "http"}
                    onValueChange={(value) => setConnectionType(value === 'mqtt' ? 'mqtt' : 'rest')}
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="http">HTTP (ESP32)</TabsTrigger>
                        <TabsTrigger value="mqtt">MQTT (Zigbee)</TabsTrigger>
                    </TabsList>
                    <TabsContent value="http" className="space-y-4 pt-4">

                        <div className={"flex gap-2"}>
                            <div className="space-y-2">
                                <Label htmlFor="rest-domain">API Domain</Label>
                                <Input
                                    id="rest-domain"
                                    placeholder="localhost"
                                    value={restConfig?.domain ?? ''}
                                    onChange={(e) => updateRestConnection({domain: e.target.value})}
                                />

                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rest-port">Port</Label>
                                <Input
                                    id="rest-port"
                                    placeholder="1883"
                                    value={restConfig ? String(restConfig.port) : ''}
                                    onChange={(e) => {
                                        const port = parseInt(e.target.value);
                                        if (!isNaN(port)) {
                                            updateRestConnection({port});
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rest-endpoint">Endpoint</Label>
                                <Input
                                    id="rest-endpoint"
                                    placeholder="/api/v1/sensor_data"
                                    value={restConfig?.endpoint ?? ''}
                                    onChange={(e) => updateRestConnection({endpoint: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={"flex gap-2 items-center"}>
                            <Button size={"sm"} variant={"outline"}>
                                <Unplug className="mr-2 h-4 w-4"/>
                                Probar Conexión
                            </Button>
                            <p className={"text-xs text-muted-foreground"}>{getRestEndpoint()}</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="mqtt" className=" pt-4 space-y-4 ">
                        <div className={"flex gap-2"}>
                            <div className="space-y-2">
                                <Label htmlFor="mqtt-broker">MQTT Broker</Label>
                                <Input
                                    id="mqtt-broker"
                                    placeholder="localhost"
                                    value={mqttConfig?.broker ?? ''}
                                    onChange={(e) => updateMqttConnection({broker: e.target.value})}
                                />

                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mqtt-port">Port</Label>
                                <Input
                                    id="mqtt-port"
                                    placeholder="1883"
                                    value={mqttConfig ? String(mqttConfig.port) : ''}
                                    onChange={(e) => {
                                        const port = parseInt(e.target.value);
                                        if (!isNaN(port)) {
                                            updateMqttConnection({port});
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mqtt-topic">Topic</Label>
                                <Input
                                    id="mqtt-topic"
                                    placeholder="iot/sensors"
                                    value={mqttConfig?.topic ?? ''}
                                    onChange={(e) => updateMqttConnection({topic: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className={"flex gap-2 items-center"}>
                            <Button size={"sm"} variant={"outline"}>
                                <Unplug className="mr-2 h-4 w-4"/>
                                Probar Conexión
                            </Button>
                            <p className={"text-xs text-muted-foreground"}>{getMqttEndpoint()}</p>
                        </div>
                    </TabsContent>
                </Tabs>

            </CardContent>
            <CardFooter className="flex justify-between border-t gap-6 items-center ">
                <Button className={"flex-1"} onClick={() => addDevice("esp32")}>
                    <Wifi className="mr-2 h-4 w-4"/>
                    Agregar ESP32
                </Button>
                <Button className={"flex-1"} onClick={() => addDevice("zigbee")}>
                    <Radio className="mr-2 h-4 w-4"/>
                    Agregar Zigbee
                </Button>
            </CardFooter>
        </Card>
    )
}
