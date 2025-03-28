import React from "react";
import type {Route} from "./+types/devices";
import {createActionHandler, type HandlerResult} from "~/routes/settings/handler/connection-settings-handler";
import {CreateSensorSchema, DeleteSensorSchema, UpdateSensorSchema} from "~/routes/devices/schemas/sensor.schema";
import {data, Outlet, useSearchParams} from "react-router";
import {DevicesGrid} from "~/routes/devices/components/devices-grid";
import {sensorDataSentSchema, sensorModifyPayloadSchema} from "~/routes/devices/schemas/sensor-data.schema";
import {sensorSessionService} from "~/routes/devices/services/sensor-session.server";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "SimulaDIoT - Dispositivos"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

type RequestHandler = (request: Request, formData: FormData) => Promise<HandlerResult>

const sensorHandlers: Record<string, RequestHandler> = {
    "create-sensor": createActionHandler(
        CreateSensorSchema,
        (request, value) => sensorSessionService.createNewSensor(request, value)
    ),
    "update-sensor": createActionHandler(
        UpdateSensorSchema,
        (request, value) => sensorSessionService.updateSensorData(request, value)
    ),
    "delete-sensor": createActionHandler(
        DeleteSensorSchema,
        (request, value) => sensorSessionService.deleteSensor(request, value.sensorId)
    ),
    "regenerate-device-payload": createActionHandler(
        sensorDataSentSchema,
        (request, value) => sensorSessionService.regenerateSensorPayload(request, value.sensorId)
    ),
    "modify-device-payload": createActionHandler(
        sensorModifyPayloadSchema,
        (request, value) => sensorSessionService.updateSensorPayload(request, value)
    ),
    // "send-device-payload": createActionHandler(
    //     sensorDataSentSchema,
    //     (value) => sensorDataService.sendDeviceData(value)
    // )
}


export async function loader({request}: Route.LoaderArgs) {
    const sensors = await sensorSessionService.getAllSensors(request);
    return {sensors};
}


export async function action({request}: Route.ActionArgs) {
    const formData = await request.formData();
    const intentValue = formData.get("intent");

    console.log(`Called server action with intent: ${intentValue}`);

    if (!intentValue || typeof intentValue !== "string") {
        return data({error: "Intent not provided or invalid"}, {status: 400});
    }

    if (!(intentValue in sensorHandlers)) {
        return data({error: `Unsupported intent: ${intentValue}`}, {status: 400});
    }

    const intent = intentValue as keyof typeof sensorHandlers;
    const handler = sensorHandlers[intent];

    const handlerResult = await handler(request, formData);

    const status = handlerResult.conformResult?.status === "error" ? 400 : 200;

    return data(handlerResult.conformResult, {
        status: status,
        headers: handlerResult.headers,
    })
}


export default function Devices({loaderData}: Route.ComponentProps) {
    const {sensors} = loaderData
    const [searchParams, _] = useSearchParams();

    const viewMode = searchParams.get("view") as "grid" | "tabs";

    return (
        <>
            <div>
                {viewMode === "tabs" ?
                    <Outlet/> :
                    <DevicesGrid sensors={sensors}/>
                }
            </div>
        </>
    )
}