import type {Sensor} from "~/routes/devices/schemas/sensor.schema";
import {DeviceCard} from "~/routes/devices/components/device-card";

export function DevicesGrid({sensors, connectionStrings}: {
    sensors: Sensor[],
    connectionStrings: { http: string, mqtt: string }
}) {
    return (
        <>
            {sensors.length === 0 ?
                <div className={"flex flex-col  gap-2  border p-6 rounded-xl shadow"}>
                    <p className={"text-sm "}>No hay dispositivos registrados</p>
                    <p className={"text-sm text-muted-foreground"}>
                        Puedes añadir dispositivos desde el panel de la izquierda.
                    </p>
                </div> :
                <div className={"grid sm:grid-cols-2 2xl:grid-cols-3 gap-6"}>
                    {sensors.map(sensor => <DeviceCard connectionStrings={connectionStrings} key={sensor.id}
                                                       sensor={sensor}/>)}
                </div>
            }
        </>
    )
}