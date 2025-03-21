import {Label} from "~/components/ui/label"
import {Slider} from "~/components/ui/slider"
import {Switch} from "~/components/ui/switch"
import {sensorDataService} from "~/routes/devices/services/sensor-data.service";
import {useState} from "react";
import type {SensorStatus} from "~/routes/devices/schemas/sensor.schema";

interface SettingsTabProps {
    deviceId: string
    sendingTo: string
    sensorStatus: SensorStatus
    setSensorStatus: (value: (prevStatus: SensorStatus) => any) => void
}

export function SettingsTab({
                                deviceId,
                                sendingTo,
                                sensorStatus,
                                setSensorStatus
                            }: SettingsTabProps) {

    const [intervalTime, setIntervalTime] = useState(5000)

    const toggleAutoSend = () => {
        if (sensorStatus.isSending) {
            sensorDataService.stopAutoSend(deviceId);
            setSensorStatus(prevStatus => ({
                ...prevStatus,
                isSending: false
            }));
        } else {
            sensorDataService.startAutoSend(deviceId, intervalTime);
            setSensorStatus(prevStatus => ({
                ...prevStatus,
                isSending: true
            }));
        }
    }

    const toggleRealisticValues = () => {
        if (sensorStatus.isVariable) {
            sensorDataService.stopAutoSend(deviceId);
            setSensorStatus(prevStatus => ({
                ...prevStatus,
                isVariable: false
            }));
            if (sensorStatus.isSending) {
                sensorDataService.startAutoSend(deviceId, intervalTime);
            }
        } else {
            sensorDataService.startAutoSend(deviceId, intervalTime, true);
            setSensorStatus(prevStatus => ({
                isSending: true,
                isVariable: true
            }));
        }
    }


    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`interval-${deviceId}`}>Intervalo en segundos</Label>
                    <span className="text-sm">{intervalTime / 1000}s</span>
                </div>
                <Slider
                    disabled={sensorStatus.isSending}
                    id={`interval-${deviceId}`}
                    min={1000}
                    max={30000}
                    step={1000}
                    value={[intervalTime]}
                    onValueChange={(value) => setIntervalTime(value[0])}
                />
            </div>
            <div className={"h-2"}/>
            <div className={"space-y-2"}>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`auto-send-${deviceId}`}>Enviar automáticamente</Label>
                    <Switch id={`auto-send-${deviceId}`} checked={sensorStatus.isSending}
                            onCheckedChange={toggleAutoSend}/>
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
                        checked={sensorStatus.isVariable}
                        onCheckedChange={toggleRealisticValues}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Si está activado, los valores variarán ligeramente con cada envío automático para simular el
                    comportamiento real un sensor.
                </p>
            </div>

            <div className={"h-2"}/>

            <div className="space-y-1">
                <Label>Enviando a:</Label>
                <p className="text-sm text-muted-foreground truncate">{sendingTo}</p>
            </div>

        </>
    )
}