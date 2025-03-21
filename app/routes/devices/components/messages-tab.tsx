import {Button} from "~/components/ui/button"
import {Badge} from "~/components/ui/badge"
import {ArrowRight, CheckCircle, Clock, Send, Trash2, XCircle} from "lucide-react"
import {ScrollArea} from "~/components/ui/scroll-area"
import type {Message} from "../schemas/message.schema"
import {cn} from "~/lib/utils";


export function MessagesTab({messages}: { messages: Message[] }) {

    let mockMessages = messages;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString() + " " + date.toLocaleDateString()
    }

    const description = messages.length === 1
        ? `Mostrando el último mensaje del dispositivo`
        : `Mostrando los últimos ${messages.length} mensajes del dispositivo`

    return (
        <div>
            <div className="">
                <h3 className="text-sm font-medium mb-4">{description}</h3>

                {mockMessages.length > 0 ? (
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-6">
                            {mockMessages.map((message) => (
                                <div key={message.id} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground"/>
                                            <span
                                                className="text-sm text-muted-foreground">{formatDate(message.timestamp)}</span>
                                        </div>
                                        <Badge
                                            className={cn(message.response.status === 200 && "bg-green-600/90")}
                                            variant={message.response.status === 200 ? "default" : "destructive"}
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
                    <Button variant="outline" size="sm">
                        <Trash2 className="mr-2 h-4 w-4"/>
                        Limpiar Historial
                    </Button>
                </div>
            </div>
        </div>
    )
}