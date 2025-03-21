import {Card, CardContent, CardHeader, CardTitle} from "~/components/ui/card";
import {AppLogo} from "~/components/app-logo";
import {ThemeSwitch} from "~/components/theme-switch";
import React from "react";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import {ExternalLink, Github, Radio, Wifi} from "lucide-react";
import {Outlet} from "react-router";
import {NavLink} from "~/components/link";
import {cn} from "~/lib/utils";
import {Button} from "~/components/ui/button";
import {sensorService} from "~/routes/devices/services/sensor.service";
import type {Sensor} from "~/routes/devices/schemas/sensor.schema";
import type {Route} from "./+types/layout";
import {CreateSensorDialog} from "~/routes/devices/components/create-sensor-dialog";


export async function clientLoader({request}: Route.ClientLoaderArgs) {

    const sensors = sensorService.getAllSensors();

    return {
        sensors
    }

}

export default function Layout({loaderData}: Route.ComponentProps) {

    const {sensors} = loaderData;


    return (
        <>
            <Header/>
            <div className={"grid 2xl:grid-cols-5 lg:grid-cols-4 container  mx-auto p-2 py-4 items-start relative"}>
                <SidePanel sensors={sensors}/>
                <main
                    className={"2xl:col-span-4 lg:col-span-3 sm:ml-6  flex flex-col gap-6 "}>
                    <Outlet/>
                </main>
            </div>
        </>
    )
}

function SidePanel({sensors}: { sensors: Sensor[] }) {


    const navigationLinks: NavigationLink[] = [
        {
            name: "Configuración",
            to: "/settings"
        },
        {
            name: `Dispositivos ${sensors.length > 0 ? `(${sensors.length})` : ""}`,
            to: "/devices"
        },
    ]

    return (
        <Card className={"col-span-1 gap-2 lg:sticky top-[6rem] z-20"}>
            <CardHeader>
                <CardTitle className={"text-lg"}>Navegación</CardTitle>
            </CardHeader>
            <CardContent className={"flex flex-col gap-6 "}>
                <nav className={"flex flex-col gap-2 "}>
                    {navigationLinks.map((link, index) =>
                        <NavLink
                            key={index}
                            to={link.to}
                            className={({isActive, isPending}) =>
                                cn("border p-2 px-3 text-sm rounded-md", isActive && "bg-primary text-primary-foreground")
                            }
                        >
                            {link.name}
                        </NavLink>
                    )}
                </nav>
                <div className={"flex justify-between gap-2 flex-wrap"}>
                    <p className={"text-sm font-semibold"}>Añadir Dispositivo</p>
                    <div className={"flex justify-between gap-2 flex-wrap  w-full "}>
                        <CreateSensorDialog type={"ESP32"}>
                            <Button className={"flex grow"}>
                                <Wifi className="mr-2 h-4 w-4"/>
                                ESP32
                            </Button>
                        </CreateSensorDialog>

                        <CreateSensorDialog type={"ZIGBEE"}>
                            <Button className={"flex grow"}>
                                <Radio className="mr-2 h-4 w-4"/>
                                Zigbee
                            </Button>
                        </CreateSensorDialog>
                    </div>
                </div>
                <DeviceList sensors={sensors}/>
            </CardContent>
        </Card>

    )
}

function DeviceList({sensors}: { sensors: Sensor[] }) {

    return (
        <>
            <div className={"flex flex-col gap-2"}>
                <p className={"text-sm font-semibold"}>Dispositivos</p>

                <div className={" space-y-2"}>
                    {sensors.map(sensor => (
                        <NavLink
                            to={`/${sensor.id}`}
                            key={sensor.id}
                            className={({isActive, isPending}) =>
                                cn("items-center gap-4 p-2 px-3 text-sm rounded-md flex bg-secondary tracking-tighter",
                                    isActive && "ring-1 ring-primary font-bold tracking-tighter")
                            }

                        >
                            <div className={"flex gap-2 items-center text-nowrap overflow-hidden"}>
                                {sensor.type === "ESP32" ? <Wifi size={16}/> : <Radio size={16}/>}
                                {sensor.name}
                            </div>
                            <div>
                                {/*    TODO: indicators for auto-send, realistic values, etc*/}
                            </div>
                        </NavLink>
                    ))}
                </div>
            </div>

        </>
    )
}

function Header() {
    return (
        <header
            className={"flex bg-background items-center justify-between p-4 border-b border-border shadow-xs sticky top-[0px]  z-30"}>
            <div className={"container mx-auto px-2 flex items-center gap-4 justify-between"}>
                <div className={"flex items-center gap-4 "}>
                    <AppLogo/>
                    <div>
                        <h1 className={"text-lg font-semibold"}>SimulaDIoT <span className={"hidden sm:inline"}>- Simulador de Dispositivos IoT</span>
                        </h1>
                        <p className={"text-xs text-muted-foreground hidden sm:block "}>
                            Prueba tu API con dispositivos ESP32 y Zigbee simulados. Configura y envía datos a tu
                            servidor.
                        </p>
                    </div>
                </div>
                <div className={"flex items-center gap-4"}>
                    <GithubLink/>
                    <ThemeSwitch/>
                </div>
            </div>
        </header>
    )
}


function GithubLink() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>

                <div className={" h-8 w-fit flex justify-center items-center p-2 rounded-full border"}>
                    <a
                        href="https://github.com/CristobalNPE/iot-device-simulator" target="_blank"
                        rel="noreferrer">
                        <Github size={20}/>
                    </a>
                </div>


            </TooltipTrigger>
            <TooltipContent>
                <p>Ver en GitHub <ExternalLink size={14} className={"inline-flex ml-1"}/></p>
            </TooltipContent>
        </Tooltip>
    )
}

type NavigationLink = {
    name: string;
    to: string;
}
