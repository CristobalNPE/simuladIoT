import type {Sensor} from "~/routes/devices/schemas/sensor.schema";
import {DeviceCard} from "~/routes/devices/components/device-card";

export function DevicesGrid({sensors, connectionStrings}: {
    sensors: Sensor[],
    connectionStrings: { http: string, mqtt: string }
}) {
    return (
        <div className={"grid sm:grid-cols-2 2xl:grid-cols-3 gap-6"}>
            {sensors.map(sensor => <DeviceCard connectionStrings={connectionStrings} key={sensor.id} sensor={sensor}/>)}
        </div>
    )
}