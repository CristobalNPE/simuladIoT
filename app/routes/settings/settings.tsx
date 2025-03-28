import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import React from "react";
import {HttpSettingsForm} from "~/routes/settings/components/http-settings-form";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {Route} from "../../../.react-router/types/app/routes/settings/+types/settings";
import {BrokerSettingsForm} from "~/routes/settings/components/broker-settings-form";
import {SectionHeader} from "~/components/section-header";
import {
    BrokerConnectionSettingsSchema,
    HttpConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {data} from "react-router";
import {createActionHandler, type RequestHandler} from "~/utils/action-handler";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "SimulaDIoT - Configuración"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

const settingsActionHandlers: Record<string, RequestHandler> = {
    "update-broker-settings": createActionHandler(
        BrokerConnectionSettingsSchema,
        connectionStorageService.storeBrokerConnectionSettings
    ),
    "update-http-settings": createActionHandler(
        HttpConnectionSettingsSchema,
        connectionStorageService.storeHttpConnectionSettings
    )
}

export async function action({request}: Route.ActionArgs) {

    const formData = await request.formData();
    const intentValue = formData.get("intent");

    console.log(`Called action on settings storage with intent: ${intentValue}`)

    if (!intentValue || typeof intentValue !== "string" || !(intentValue in settingsActionHandlers)) {
        return data({status: 'error', error: {'': ['Intent not provided or invalid']}}, {status: 400});
    }
    const intent = intentValue as keyof typeof settingsActionHandlers;
    const handler = settingsActionHandlers[intent];

    const handlerResult = await handler(request, formData);

    const status = handlerResult.conformResult?.status === 'error' ? 400 : 200;

    return data(handlerResult.conformResult, {
        status: status,
        headers: handlerResult.headers,
    });

}

export async function loader({request}: Route.LoaderArgs) {

    const [brokerSettings, httpSettings] = await Promise.all([
        connectionStorageService.getBrokerConnectionSettingsFromRequest(request),
        connectionStorageService.getHttpConnectionSettingsFromRequest(request)
    ])

    return {httpSettings, brokerSettings};
}

export default function Settings({loaderData}: Route.ComponentProps) {

    const {httpSettings, brokerSettings} = loaderData

    return (
        <div className={"col-span-3  bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm"}>
            <SectionHeader
                title={"Configuración de Conexión"}
                description={"Configura los detalles de conexión hacia tu API"}
            />
            <Tabs defaultValue="http" className="w-full ">
                <TabsList className={"w-full grid grid-cols-2"}>
                    <TabsTrigger value="http">HTTP (ESP32)</TabsTrigger>
                    <TabsTrigger value="mqtt">MQTT (Zigbee)</TabsTrigger>
                </TabsList>
                <TabsContent value="http" className={"pt-4"}>
                    <HttpSettingsForm currentSettings={httpSettings}/>
                </TabsContent>
                <TabsContent value="mqtt" className={"pt-4"}>
                    <BrokerSettingsForm currentSettings={brokerSettings}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

