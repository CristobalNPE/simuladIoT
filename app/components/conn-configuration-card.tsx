import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {Radio, Unplug, Wifi} from "lucide-react";
import {useConnection} from "~/context/connection-context";
import type {ConnectionConfig, MqttConnection, RestConnection} from "~/types/connection.types";
import React from "react";
import type {DeviceType} from "~/types/device.types";
import {HelpTooltip} from "~/components/help-tooltip";
import {useConnectionTesting} from "~/hooks/useConnectionTesting";

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

    const {
        isTestingConnection,
        testConnection,
        ConnectionStatusBadge
    } = useConnectionTesting();

    const handleTestConnection = () => {
        testConnection(connectionConfig);
    }

    const restConfig = connectionType === 'rest' ? connectionConfig as RestConnection : null;
    const mqttConfig = connectionType === 'mqtt' ? connectionConfig as MqttConnection : null;


    return (
        <Card className="col-span-1">
            <CardHeader className={"flex items-center justify-between"}>
                <div className={"flex flex-col gap-1.5"}>
                    <CardTitle>Configuración</CardTitle>
                    <CardDescription>Configura los detalles de conexión hacia tu API</CardDescription>
                </div>
                <HelpTooltip/>
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

                        <div className={"flex gap-2 justify-between"}>
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
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <Button
                                onClick={handleTestConnection}
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={!restConfig?.domain || !restConfig.port || !restConfig.endpoint || isTestingConnection}
                            >
                                <Unplug className="h-4 w-4"/>
                                {isTestingConnection ? "Probando..." : "Probar Conexión"}
                            </Button>

                            <div
                                className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">
                                {getRestEndpoint()}
                            </div>

                            <ConnectionStatusBadge type={"http"}/>
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
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <Button
                                variant="outline"
                                onClick={handleTestConnection}
                                disabled={!mqttConfig?.broker || !mqttConfig.port || !mqttConfig.topic || isTestingConnection}
                            >
                                <Unplug className="h-4 w-4"/>
                                {isTestingConnection ? "Probando..." : "Probar Conexión"}
                            </Button>


                            <div
                                className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">
                                {getMqttEndpoint()}
                            </div>

                            <ConnectionStatusBadge type={"mqtt"}/>
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


function TestConnectionButton({config, connectionString}: { config: ConnectionConfig, connectionString: string }) {


    const restConfig = config.connectionType === 'rest' ? config as RestConnection : null;
    const mqttConfig = config.connectionType === 'mqtt' ? config as MqttConnection : null;

    if (!restConfig && !mqttConfig) return null

    if (restConfig) {
        return (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Button
                    // onClick={testConnection}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={!restConfig?.domain || !restConfig.port || !restConfig.endpoint}
                >
                    <Unplug className="h-4 w-4"/>
                    Probar Conexión
                </Button>

                <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">
                    {connectionString}
                </div>

                {/*{connectionStatus === "success" && (*/}
                {/*    <span className="text-green-500 text-sm flex items-center">Conectado</span>*/}
                {/*)}*/}

                {/*{connectionStatus === "error" && (*/}
                {/*    <span className="text-red-500 text-sm flex items-center">Error de conexión</span>*/}
                {/*)}*/}
            </div>
        )
    }

}