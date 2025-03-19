import {Label} from "~/components/ui/label"
import {Slider} from "~/components/ui/slider"
import {Switch} from "~/components/ui/switch"
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
    useRealisticValues: boolean
    setUseRealisticValues: (value: boolean) => void
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
                                useRealisticValues,
                                setUseRealisticValues
                            }: SettingsTabProps) {
    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`interval-${deviceId}`}>Intervalo en segundos</Label>
                    <span className="text-sm">{intervalTime}s</span>
                </div>
                <Slider
                    disabled={isSending}
                    id={`interval-${deviceId}`}
                    min={1}
                    max={30}
                    step={1}
                    value={[intervalTime]}
                    onValueChange={(value) => setIntervalTime(value[0])}
                />
            </div>
            <div className={"h-2"}/>
            <div className={"space-y-2"}>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`auto-send-${deviceId}`}>Enviar automáticamente</Label>
                    <Switch id={`auto-send-${deviceId}`} checked={isSending} onCheckedChange={toggleAutoSend}/>
                </div>
                <p className="text-xs text-muted-foreground">
                    Enviar valores automáticamente a tu API cada X segundos definidos en el intervalo.
                </p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`realistic-${deviceId}`}>Sensor realista</Label>
                    <Switch
                        id={`realistic-${deviceId}`}
                        checked={useRealisticValues}
                        onCheckedChange={setUseRealisticValues}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Si está activado, los valores variarán ligeramente con cada envío automático para simular el comportamiento real un sensor.
                </p>
            </div>

            <div className={"h-2"}/>
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