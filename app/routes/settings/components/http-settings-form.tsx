import {type HttpConnectionSettings, HttpConnectionSettingsSchema} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {useConnTesting} from "~/hooks/use-conn-testing";
import {useSpinDelay} from "spin-delay";
import {ErrorList, Field} from "~/components/forms";
import {Button} from "~/components/ui/button";
import {Unplug} from "lucide-react";
import {StatusButton} from "~/components/ui/status-button";
import React from "react";
import type {clientAction} from "~/routes/settings/settings";
import {useSuccessToast} from "~/hooks/use-success-toast";
import {toast} from "sonner";

export function HttpSettingsForm({currentSettings}: { currentSettings: HttpConnectionSettings }) {
    const fetcher = useFetcher<typeof clientAction>(({key: "http-connection-settings"}))
    const isPending = fetcher.state !== "idle"

    const [form, fields] = useForm({
        id: `http-connection-settings-form`,
        constraint: getZodConstraint(HttpConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: HttpConnectionSettingsSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const {
        isTestingConnection,
        testConnection,
        ConnectionStatusBadge
    } = useConnTesting();


    const isLocalDomain = fields.domain.value === 'localhost' || fields.domain.value === '127.0.0.1';
    const protocol = isLocalDomain ? "http" : "https";
    const sanitizedEndpoint = fields.endpoint.value?.startsWith("/") ? fields.endpoint.value : `/${fields.endpoint.value}`
    const connectionString =
        `${protocol}://${fields.domain.value}${isLocalDomain ? `:${fields.port.value}` : ''}${sanitizedEndpoint}`

    const isValidConnectionString = Boolean(
        fields.domain.value &&
        fields.endpoint.value &&
        (!isLocalDomain || fields.port.value)
    );

    const delayedIsTestingConnection = useSpinDelay(isTestingConnection, {
        delay: 500,
        minDuration: 200,
    })

    const handleTestConnection = () => {
        try {
            if(fields.domain.value && fields.endpoint.value && fields.port.value) {
                testConnection({
                    domain: fields.domain.value,
                    endpoint: fields.endpoint.value,
                    port: Number(fields.port.value),
                    isLocal: isLocalDomain,
                } as HttpConnectionSettings);
            }
        } catch (error) {
            console.error("Error testing connection:", error);
            toast.error("Error al probar la conexión. Por favor, revisa los datos ingresados.")
        }
    }

    useSuccessToast(fetcher, "Configuración HTTP guardada correctamente.")

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
                        labelProps={{children: "API Domain"}}
                        inputProps={{
                            ...getInputProps(fields.domain, {type: "text"}),
                            autoComplete: "domain",
                            placeholder: "localhost"

                        }}
                        errors={fields.domain.errors}
                    />
                    <Field
                        labelProps={{children: "Port"}}
                        inputProps={{
                            ...getInputProps(fields.port, {type: "number"}),
                            autoComplete: "port",
                            placeholder: "8080"

                        }}
                        errors={fields.port.errors}
                    />
                    <Field
                        labelProps={{children: "Endpoint"}}
                        inputProps={{
                            ...getInputProps(fields.endpoint, {type: "text"}),
                            autoComplete: "endpoint",
                            placeholder: "/api/v1/sensor_data"

                        }}
                        errors={fields.endpoint.errors}
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

                    <ConnectionStatusBadge type={"http"}/>
                </div>

                <div className={"flex justify-center mt-6"}>
                    <StatusButton
                        className={"w-full"}
                        name={"intent"}
                        value={"update-http-settings"}
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