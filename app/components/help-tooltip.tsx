import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip"
import {Button} from "~/components/ui/button"
import {ExternalLink, InfoIcon} from "lucide-react"

export function HelpTooltip() {
    return (
        <Tooltip delayDuration={500}>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                    <InfoIcon className="h-5 w-5 text-muted-foreground"/>
                </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm p-4">
                <div className="space-y-2">
                    <h4 className="font-medium">Consejos para MQTT</h4>
                    <p className="text-sm text-muted-foreground">Puedes configurar tu propio servidor MQTT usando:</p>
                    <ul className="text-sm list-disc pl-4 space-y-1">
                        <li className={""}>Mosquitto - Servidor MQTT de código abierto
                            <a
                                href="https://mosquitto.org/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs inline-flex text-background hover:underline"
                            >
                                <ExternalLink className="ml-2 h-3 w-3"/>
                            </a>
                        </li>
                        <li>
                            HiveMQ - Ofrece un broker gratuito en la nube
                            <a
                                href="https://www.hivemq.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs inline-flex text-background hover:underline"
                            >
                                <ExternalLink className="ml-2 h-3 w-3"/>
                            </a>
                        </li>
                    </ul>

                </div>
            </TooltipContent>
        </Tooltip>
    )
}