import {Tabs, TabsContent, TabsList, TabsTrigger} from "~/components/ui/tabs";
import {HttpConnectionSettingsSchema, MqttConnectionSettingsSchema} from "~/routes/settings/schemas/connection.schema";
import React from "react";
import {HttpSettingsForm} from "~/routes/settings/components/http-settings-form";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {Route} from "../../../.react-router/types/app/routes/settings/+types/settings";
import {createActionHandler} from "~/routes/settings/handler/connection-settings-handler";
import {MqttSettingsForm} from "~/routes/settings/components/mqtt-settings-form";
import {SectionHeader} from "~/components/section-header";


const connectionSettingsHandlers = {
    "update-http-settings": createActionHandler(
        HttpConnectionSettingsSchema,
        (value) => connectionStorageService.saveHttpSettings(value)
    ),

    "update-mqtt-settings": createActionHandler(
        MqttConnectionSettingsSchema,
        (value) => connectionStorageService.saveMqttSettings(value)
    ),
};

export async function clientLoader({request}: Route.ClientLoaderArgs) {
    return {
        httpSettings: connectionStorageService.getHttpSettings(),
        mqttSettings: connectionStorageService.getMqttSettings()
    };
}

export async function clientAction({request}: Route.ClientActionArgs) {
    const formData = await request.formData();
    const intentValue = formData.get("intent");

    if (!intentValue || typeof intentValue !== "string") {
        throw new Error("Intent not provided or invalid");
    }

    if (!(intentValue in connectionSettingsHandlers)) {
        throw new Error(`Unsupported intent: ${intentValue}`);
    }

    const intent = intentValue as keyof typeof connectionSettingsHandlers;
    const handler = connectionSettingsHandlers[intent];

    return handler(formData);
}

export default function Settings({loaderData}: Route.ComponentProps) {

    const {httpSettings, mqttSettings} = loaderData

    return (
        <div  className={"col-span-3  bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm"}>
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
                    <MqttSettingsForm currentSettings={mqttSettings}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

