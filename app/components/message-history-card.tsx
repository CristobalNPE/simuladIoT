import React from "react";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {ScrollArea} from "~/components/ui/scroll-area";
import {Radio, Wifi} from "lucide-react";
import {Badge} from "~/components/ui/badge";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "~/components/ui/accordion";
import {Button} from "~/components/ui/button";
import {formatJSONMessage} from "~/utils/format.utils";
import type {DeviceInfoWithTimestamp} from "~/types/device.types";

export function MessageHistoryCard(
    {messageHistory, setMessageHistory}: {
        messageHistory: DeviceInfoWithTimestamp[],
        setMessageHistory: React.Dispatch<React.SetStateAction<DeviceInfoWithTimestamp[]>>
    }
) {

    const description = messageHistory.length !== 1
        ? `Mostrando las ultimas ${messageHistory.length} solicitudes a tu API.`
        : `Mostrando la solitud mas reciente a tu API.`

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Historial de Mensajes</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className={"flex-1"}>
                <ScrollArea className="h-[320px] w-full rounded-md border p-2">
                    {messageHistory.length > 0 ? (
                        <div className="space-y-2">
                            {messageHistory.map((msg, i) => (
                                <MessageRow msg={msg} key={i}/>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-muted-foreground">Aún no se ha enviado ningún mensaje</p>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter>
                <Button variant="outline" onClick={() => setMessageHistory([])} className="w-full">
                    Borrar Historial
                </Button>
            </CardFooter>
        </Card>
    )
}

function MessageRow({msg}: { msg: DeviceInfoWithTimestamp }) {

    const formattedDeviceId = `${msg.deviceId.toUpperCase().split("-")[0]}-[${msg.deviceId.toUpperCase().split("-")[1].slice(-4)}]`

    return (
        <div className="rounded-lg border p-3 pb-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {msg.deviceType === ("esp32") ? (
                        <Wifi className="mr-2 h-4 w-4"/>
                    ) : (
                        <Radio className="mr-2 h-4 w-4"/>
                    )}
                    <span className="font-medium">
                     {msg.deviceName ?? formattedDeviceId}
                    </span>
                </div>
                <div className={"flex gap-2 items-center"}>
                    <div className=" text-xs text-muted-foreground">{msg.timestamp.toLocaleTimeString()}</div>
                    <Badge variant={
                        (msg.status && msg.status >= 200 && msg.status < 300) ? "default" :
                            (msg.status ? "destructive" : "default")}>
                        {msg.status ? `${msg.status}` : "Enviado"}
                    </Badge>
                </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="payload">
                    <AccordionTrigger className="text-xs">Ver Payload</AccordionTrigger>
                    <AccordionContent>
                        <pre
                            className="text-xs overflow-auto p-2 bg-muted rounded-md">{formatJSONMessage(msg.message)}</pre>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}