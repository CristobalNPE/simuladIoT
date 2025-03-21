import type {Sensor} from "~/routes/devices/schemas/sensor.schema";
import {SectionHeader} from "~/components/section-header";
import {CreateSensorDialog} from "~/routes/devices/components/create-sensor-dialog";
import {Button} from "~/components/ui/button";
import {Radio, Wifi} from "lucide-react";
import React from "react";
import {Outlet} from "react-router";
import {NavLink} from "~/components/link";

export function DevicesTabs({sensors, connectionStrings}: {
    sensors: Sensor[],
    connectionStrings: { http: string, mqtt: string }
}) {
    return (
        <div  className={"col-span-3  bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm"}>
            <div className={"flex justify-between items-center gap-6"}>
                <SectionHeader title={"Dispositivos"} description={"Gestiona tus dispositivos simulados"}/>
                <div className={"flex gap-2 "}>
                    <CreateSensorDialog type={"ESP32"}>
                        <Button className={"flex-1"}>
                            <Wifi className="mr-1 h-4 w-4"/>
                            Añadir ESP32
                        </Button>
                    </CreateSensorDialog>
                    <CreateSensorDialog type={"ZIGBEE"}>
                        <Button className={"flex-1"}>
                            <Radio className="mr-1 h-4 w-4"/>
                            Añadir Zigbee
                        </Button>
                    </CreateSensorDialog>

                </div>
            </div>
            <nav>
                {sensors.map(sensor => <NavLink
                    key={sensor.id}
                    to={{
                    pathname: `/devices/${sensor.id}`,
                    search: "?view=tabs"

                }}>{sensor.name}</NavLink>)}
            </nav>
            <div>
                <Outlet/>
            </div>
        </div>
    )
}