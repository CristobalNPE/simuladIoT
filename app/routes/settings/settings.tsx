import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import React from "react";
import {HttpSettingsForm} from "~/routes/settings/components/http-settings-form";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {Route} from "../../../.react-router/types/app/routes/settings/+types/settings";
import {BrokerSettingsForm} from "~/routes/settings/components/broker-settings-form";
import {SectionHeader} from "~/components/section-header";
import {z} from "zod";
import {
    BrokerConnectionSettingsSchema,
    HttpConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {settingsSessionStorage} from "~/routes/settings/sessions/settings-storage.server";
import {parseWithZod} from "@conform-to/zod";
import {data} from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "SimulaDIoT - Configuración"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}

type IntentConfig = {
    schema: z.ZodSchema<any>;
    sessionKey: string;
}

const intentConfigs: Record<string, IntentConfig> = {
    "update-broker-settings": {
        schema: BrokerConnectionSettingsSchema,
        sessionKey: "broker-settings",
    },
    "update-http-settings": {
        schema: HttpConnectionSettingsSchema,
        sessionKey: "http-settings",
    }
}

type SupportedIntent = keyof typeof intentConfigs;


export async function action({request}: Route.ActionArgs) {

    const formData = await request.formData();
    const intentValue = formData.get("intent");
    const session = await settingsSessionStorage.getSession(request.headers.get("Cookie"));

    console.log(`Called action on settings storage with intent: ${intentValue}`)

    if (!intentValue || typeof intentValue !== "string" || !(intentValue in intentConfigs)) {
        throw new Error("Intent not provided or invalid");
    }

    const intent = intentValue as SupportedIntent;
    const config = intentConfigs[intent];


    const submission = parseWithZod(formData, {schema: config.schema})
    if (submission.status !== "success") {
        return data(
            {result: submission.reply()},
            {status: submission.status !== "error" ? 400 : 200}
        );
    }
    session.set(config.sessionKey, submission.value);

    const dataResult = submission.reply();
    const withReset = submission.reply({resetForm: true});

    return data({
        result: {...dataResult, ...withReset}
    }, {
        headers: {
            "Set-Cookie": await settingsSessionStorage.commitSession(session),
        }
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

