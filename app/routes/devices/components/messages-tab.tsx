import {Button} from "~/components/ui/button"
import {Badge} from "~/components/ui/badge"
import {ArrowRight, CheckCircle, Clock, Send, Trash2, XCircle} from "lucide-react"
import {ScrollArea} from "~/components/ui/scroll-area"
import type {Message} from "../schemas/message.schema"
import {cn} from "~/lib/utils";
import {messageHistoryService} from "~/routes/devices/services/message-history.service";
import {href, useFetcher} from "react-router";


export function MessagesTab({messages,sensorId}: { messages: Message[], sensorId: string }) {

    const clearHistoryFetcher = useFetcher(({key: `clear-history-${sensorId}`}))
    const isClearing = clearHistoryFetcher.state !== "idle";

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString() + " " + date.toLocaleDateString()
    }

    const description = messages.length === 1
        ? `Mostrando el último mensaje del dispositivo`
        : `Mostrando los últimos ${messages.length} mensajes del dispositivo`

    const isSuccessResponse = (responseStatus: number) => responseStatus >= 200 && responseStatus < 300;

    const handleClearHistory = () => {

        const formData = new FormData();
        formData.set("intent", "clear-history");
        formData.set("sensorId", sensorId);

        clearHistoryFetcher.submit(formData, {
            method: "post",
            action: href("/devices"), // TODO: DEFINE THE ACTION ? WHERE
        });
    };

    return (
        <div>
            <div className="">
                <h3 className="text-sm font-medium mb-4">{description}</h3>

                {messages.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-6">
                            {messages.map((message,index) => (
                                <div key={message.id} className={cn("border rounded-lg p-4")}>
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={"font-semibold"}>{messages.length - index}</div>
                                            <Clock className="h-4 w-4 text-muted-foreground"/>
                                            <span
                                                className="text-sm text-muted-foreground">{formatDate(message.timestamp)}</span>
                                        </div>
                                        <Badge
                                            className={cn(isSuccessResponse(message.response.status) && "bg-green-600/90")}
                                            variant={isSuccessResponse(message.response.status) ? "default" : "destructive"}
                                        >
                                            {message.response.status === 200 ? (
                                                <CheckCircle className="h-3 w-3 mr-1"/>
                                            ) : (
                                                <XCircle className="h-3 w-3 mr-1"/>
                                            )}
                                            Status: {message.response.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-medium flex items-center mb-2">
                                                <Send className="h-3 w-3 mr-1"/> Solicitud Enviada
                                            </h4>
                                            <div className="bg-muted rounded-md p-2 h-[120px] overflow-auto">
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(message.request, null, 2)}
                              </pre>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-medium flex items-center mb-2">
                                                <ArrowRight className="h-3 w-3 mr-1"/> Respuesta Recibida
                                            </h4>
                                            <div className="bg-muted rounded-md p-2 h-[120px] overflow-auto">
                              <pre className="text-xs whitespace-pre-wrap">
                                {JSON.stringify(message.response, null, 2)}
                              </pre>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="rounded-md border p-6 flex items-center justify-center text-muted-foreground">
                        No hay mensajes enviados por este dispositivo
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearHistory}
                        disabled={isClearing || messages.length === 0}
                    >
                        <Trash2 className="mr-2 h-4 w-4"/>
                        {isClearing ? "Limpiando..." : "Limpiar Historial"}
                    </Button>
                </div>
            </div>
        </div>
    )
}