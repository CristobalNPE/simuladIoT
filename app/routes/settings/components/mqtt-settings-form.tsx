import {
    type HttpConnectionSettings,
    HttpConnectionSettingsSchema,
    type MqttConnectionSettings, MqttConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {useConnectionTesting} from "~/hooks/useConnectionTesting";
import {useSpinDelay} from "spin-delay";
import {ErrorList, Field} from "~/components/forms";
import {Button} from "~/components/ui/button";
import {Unplug} from "lucide-react";
import {StatusButton} from "~/components/ui/status-button";
import React from "react";
import type {clientAction} from "~/routes/settings/settings";
import {useFetcherSuccessToast} from "~/hooks/useFetcherSuccessToast";

export function MqttSettingsForm({currentSettings}: { currentSettings: MqttConnectionSettings }) {
    const fetcher = useFetcher<typeof clientAction>(({key: "mqtt-connection-settings"}))
    const isPending = fetcher.state !== "idle"

    const [form, fields] = useForm({
        id: `mqtt-connection-settings-form`,
        constraint: getZodConstraint(MqttConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: MqttConnectionSettingsSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const {
        isTestingConnection,
        testConnection,
        ConnectionStatusBadge
    } = useConnectionTesting();


    const isLocalDomain = fields.broker.value === 'localhost' || fields.broker.value === '127.0.0.1';
    const protocol = "ws"; // or tcp?
    const sanitizedTopic = fields.topic.value?.startsWith("/") ? fields.topic.value : `/${fields.topic.value}`
    const connectionString =
        `${protocol}://${fields.broker.value}${isLocalDomain ? `:${fields.port.value}` : ''}${sanitizedTopic}`

    const isValidConnectionString = Boolean(
        fields.broker.value &&
        fields.topic.value &&
        (!isLocalDomain || fields.port.value)
    );

    const delayedIsTestingConnection = useSpinDelay(isTestingConnection, {
        delay: 500,
        minDuration: 200,
    })

    const handleTestConnection = () => {
        if(fields.broker.value && fields.topic.value && fields.port.value){
            testConnection({
                broker: fields.broker.value,
                topic: fields.topic.value,
                port: Number(fields.port.value),
                isLocal: isLocalDomain,
            } as MqttConnectionSettings);
        }

    }

    useFetcherSuccessToast(fetcher, "Configuración MQTT guardada correctamente.")

    return (
        <>
            <fetcher.Form
                action={href("/settings")}
                method={"POST"}
                id={form.id}
                noValidate={form.noValidate}

            >
                <div className={"grid grid-cols-3 gap-4"}>
                    <Field
                        labelProps={{children: "MQTT Broker"}}
                        inputProps={{
                            ...getInputProps(fields.broker, {type: "text"}),
                            autoComplete: "broker",
                            placeholder: "localhost"

                        }}
                        errors={fields.broker.errors}
                    />
                    <Field
                        labelProps={{children: "Port"}}
                        inputProps={{
                            ...getInputProps(fields.port, {type: "text"}),
                            autoComplete: "port",
                            placeholder: "9001"

                        }}
                        errors={fields.port.errors}
                    />
                    <Field
                        labelProps={{children: "Topic"}}
                        inputProps={{
                            ...getInputProps(fields.topic, {type: "text"}),
                            autoComplete: "topic",
                            placeholder: "iot/sensors"

                        }}
                        errors={fields.topic.errors}
                    />
                    <input type={"hidden"} name={"isLocal"} value={isLocalDomain.toString()}/>
                </div>
                <ErrorList errors={form.errors} id={form.errorId}/>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Button
                        onClick={handleTestConnection}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={!isValidConnectionString || isTestingConnection}
                    >
                        <Unplug className="h-4 w-4"/>
                        {delayedIsTestingConnection ? "Probando..." : "Probar Conexión"}
                    </Button>

                    <div
                        className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">
                        {connectionString}
                    </div>

                    <ConnectionStatusBadge type={"mqtt"}/>
                </div>

                <div className={"flex justify-center mt-6"}>
                    <StatusButton
                        className={"w-full"}
                        name={"intent"}
                        value={"update-mqtt-settings"}
                        form={form.id}
                        status={isPending ? "pending" : form.status ?? "idle"}
                        type="submit"
                        disabled={isPending}
                    >
                        Guardar Configuración
                    </StatusButton>
                </div>
            </fetcher.Form>
        </>
    )
}