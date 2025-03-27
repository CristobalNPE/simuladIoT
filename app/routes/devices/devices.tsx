import React from "react";
import type {Route} from "./+types/devices";
import {sensorService} from "~/routes/devices/services/sensor.service";
import {createActionHandler} from "~/routes/settings/handler/connection-settings-handler";
import {CreateSensorSchema, DeleteSensorSchema, UpdateSensorSchema} from "~/routes/devices/schemas/sensor.schema";
import {Outlet, useSearchParams} from "react-router";
import {DevicesGrid} from "~/routes/devices/components/devices-grid";
import {sensorDataSentSchema, sensorModifyPayloadSchema} from "~/routes/devices/schemas/sensor-data.schema";
import {sensorDataService} from "~/routes/devices/services/sensor-data.service";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "SimulaDIoT - Dispositivos"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}


const sensorHandlers = {
    "create-sensor": createActionHandler(
        CreateSensorSchema,
        (value) => sensorService.createNewSensor(value)
    ),
    "update-sensor": createActionHandler(
        UpdateSensorSchema,
        (value) => sensorService.updateSensorData(value)
    ),
    "delete-sensor": createActionHandler(
        DeleteSensorSchema,
        (value) => sensorService.deleteSensor(value.sensorId)
    ),
    "regenerate-device-payload": createActionHandler(
        sensorDataSentSchema,
        (value) => sensorDataService.regenerateSensorPayload(value.sensorId)
    ),
    "modify-device-payload": createActionHandler(
        sensorModifyPayloadSchema,
        (value) => sensorService.updateSensorPayload(value)
    ),
    "send-device-payload": createActionHandler(
        sensorDataSentSchema,
        (value) => sensorDataService.sendDeviceData(value)
    )
}

export async function clientLoader({request}: Route.ClientLoaderArgs) {

    const sensors = sensorService.getAllSensors();
    const connectionStrings = connectionStorageService.getCurrentConnectionStrings();
    return {sensors, connectionStrings};

}

export async function clientAction({request}: Route.ClientActionArgs) {
    const formData = await request.formData();
    const intentValue = formData.get("intent");

    console.log(`Called client action with intent: ${intentValue}`);

    if (!intentValue || typeof intentValue !== "string") {
        throw new Error("Intent not provided or invalid");
    }

    if (!(intentValue in sensorHandlers)) {
        throw new Error(`Unsupported intent: ${intentValue}`);
    }

    const intent = intentValue as keyof typeof sensorHandlers;


    const handler = sensorHandlers[intent];
    return handler(formData);
}


export default function Devices({loaderData}: Route.ComponentProps) {
    const {sensors, connectionStrings} = loaderData;
    const [searchParams, _] = useSearchParams();

    const viewMode = searchParams.get("view") as "grid" | "tabs";

    return (
        <>
            <div>
                {viewMode === "tabs" ?
                    <Outlet/> :
                    <DevicesGrid connectionStrings={connectionStrings} sensors={sensors}/>
                }
            </div>
        </>
    )
}