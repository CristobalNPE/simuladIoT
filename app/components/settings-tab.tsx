import { Label } from "~/components/ui/label"
import { Slider } from "~/components/ui/slider"
import { Switch } from "~/components/ui/switch"
import type {DeviceType} from "~/types/device.types";

interface SettingsTabProps {
    deviceId: string
    deviceType: DeviceType
    intervalTime: number
    setIntervalTime: (value: number) => void
    isSending: boolean
    toggleAutoSend: () => void
    restEndpoint: string
    mqttEndpoint: string
}

export function SettingsTab({
                                deviceId,
                                deviceType,
                                intervalTime,
                                setIntervalTime,
                                isSending,
                                toggleAutoSend,
                                restEndpoint,
                                mqttEndpoint,
                            }: SettingsTabProps) {
    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`interval-${deviceId}`}>Intervalo en segundos</Label>
                    <span className="text-sm">{intervalTime}s</span>
                </div>
                <Slider
                    id={`interval-${deviceId}`}
                    min={1}
                    max={30}
                    step={1}
                    value={[intervalTime]}
                    onValueChange={(value) => setIntervalTime(value[0])}
                />
            </div>
            <div className="flex items-center space-x-2">
                <Switch id={`auto-send-${deviceId}`} checked={isSending} onCheckedChange={toggleAutoSend} />
                <Label htmlFor={`auto-send-${deviceId}`}>Enviar automáticamente</Label>
            </div>

            <div className={"h-4"}/>
            {deviceType === "esp32" ? (
                <div className="space-y-2">
                    <Label>Endpoint</Label>
                    <p className="text-sm text-muted-foreground truncate">{restEndpoint}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <Label>MQTT Topic</Label>
                    <p className="text-sm text-muted-foreground">{mqttEndpoint}</p>
                </div>
            )}
        </>
    )
}