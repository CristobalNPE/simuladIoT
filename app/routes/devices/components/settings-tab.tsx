import {Label} from "~/components/ui/label"
import {Slider} from "~/components/ui/slider"
import {Switch} from "~/components/ui/switch"
import {useSensor} from "~/routes/devices/context/sensor-context";
import {autoSendManager, type AutoSendStatus} from "~/routes/devices/services/auto-send.manager";
import {useEffect, useState} from "react";

interface SettingsTabProps {
    deviceId: string
    sendingTo: string
}

export function SettingsTab({deviceId, sendingTo}: SettingsTabProps) {

    const {sensorStatus, updateSensorStatus} = useSensor(deviceId);

    const [managerStatus, setManagerStatus] = useState<AutoSendStatus>(() =>
        autoSendManager.getAutoSendStatus(deviceId)
    );

    // effect to poll the actual status from the manager and update local view
    useEffect(() => {
        const intervalId = setInterval(() => {
            const currentManagerStatus = autoSendManager.getAutoSendStatus(deviceId);
            setManagerStatus(currentManagerStatus);

            updateSensorStatus({isSending: currentManagerStatus.enabled});
        }, 1000); // Poll every second

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [deviceId, updateSensorStatus]);


    const handleIntervalChange = (value: number[]) => {
        const newInterval = value[0];
        updateSensorStatus({intervalTime: newInterval});
        // if auto-send is active, restart it with the new interval
        if (managerStatus.enabled) {
            console.log("Restarting auto-send with new interval:", newInterval);
            autoSendManager.stopAutoSend(deviceId);
            autoSendManager.startAutoSend(
                deviceId,
                newInterval, //  new interval
                sensorStatus.isVariable // current realistic setting
            );
            // update manager status display optimistically
            setManagerStatus(autoSendManager.getAutoSendStatus(deviceId));
        }
    };

    const toggleAutoSend = () => {
        if (managerStatus.enabled) {
            autoSendManager.stopAutoSend(deviceId);
        } else {
            autoSendManager.startAutoSend(
                deviceId,
                sensorStatus.intervalTime,
                sensorStatus.isVariable
            );
        }
        setManagerStatus(autoSendManager.getAutoSendStatus(deviceId));
    };

    const toggleRealisticValues = () => {
        const newIsVariable = !sensorStatus.isVariable;
        updateSensorStatus({isVariable: newIsVariable});

        if (managerStatus.enabled) {
            console.log("Restarting auto-send with realistic:", newIsVariable);
            autoSendManager.stopAutoSend(deviceId);
            autoSendManager.startAutoSend(
                deviceId,
                sensorStatus.intervalTime,
                newIsVariable
            );
            setManagerStatus(autoSendManager.getAutoSendStatus(deviceId));
        }
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label htmlFor={`interval-${deviceId}`}>Intervalo en segundos</Label>
                    <span className="text-sm">{sensorStatus.intervalTime / 1000}s</span>
                </div>
                <Slider
                    disabled={managerStatus.enabled}
                    id={`interval-${deviceId}`}
                    min={1000}
                    max={30000}
                    step={1000}
                    value={[sensorStatus.intervalTime]}
                    onValueChange={handleIntervalChange}

                />
            </div>
            <div className={"h-2"}/>
            <div className={"space-y-2"}>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`auto-send-${deviceId}`}>Enviar automáticamente</Label>
                    <Switch id={`auto-send-${deviceId}`}
                            checked={managerStatus.enabled}
                            onCheckedChange={toggleAutoSend}
                    />
                </div>
                {managerStatus.enabled && managerStatus.lastSentAt && (
                    <p className="text-xs text-muted-foreground">
                        Último envío: {new Date(managerStatus.lastSentAt).toLocaleTimeString()}
                    </p>
                )}
                {/*{managerStatus.isSending && (*/}
                {/*    <p className="text-xs text-muted-foreground">Enviando...</p>*/}
                {/*)}*/}
                <p className="text-xs text-muted-foreground">
                    Enviar valores automáticamente cada {sensorStatus.intervalTime / 1000} segundo(s).
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
                    Si está activado, los valores variarán ligeramente con cada envío automático.
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