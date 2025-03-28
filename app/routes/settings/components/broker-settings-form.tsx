import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {ErrorList, Field, SelectField} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import React from "react";
import {brokerRequiresAuth, type BrokerType, brokerTypeMetadata, getAllBrokerTypes} from "~/types/broker.types";
import {Label} from "~/components/ui/label";
import {cn} from "~/lib/utils";
import type {action} from "~/routes/settings/settings";


export function BrokerSettingsForm({currentSettings}: { currentSettings: BrokerConnectionSettings }) {
    const fetcher = useFetcher<typeof action>(({key: "broker-connection-settings"}))
    const isPending = fetcher.state !== "idle"

    const [form, fields] = useForm({
        id: `broker-connection-settings-form`,
        constraint: getZodConstraint(BrokerConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: BrokerConnectionSettingsSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const currentBrokerRequireAuth = fields.broker.value ? brokerRequiresAuth(fields.broker.value as BrokerType) : false;
    // useSuccessToast(fetcher, "Configuración del Broker guardada correctamente.") // todo: make toast work server side

    return (
        <>
            <fetcher.Form
                action={href("/settings")}
                method={"POST"}
                {...getFormProps(form)}
            >
                <div className={"grid grid-cols-3 gap-4"}>
                    <Field className={"col-span-2"}
                           labelProps={{children: "String de Conexión"}}
                           inputProps={{
                               ...getInputProps(fields.connectionString, {type: "text"}),
                               autoComplete: "connection-string",
                               placeholder: "ej., tcp://localhost:61616",


                           }}
                           errors={fields.connectionString.errors}
                    />
                    <Field
                        labelProps={{children: "Destino (queue/topic)"}}
                        inputProps={{
                            ...getInputProps(fields.destination, {type: "text"}),
                            autoComplete: "destination",
                            placeholder: "Nombre del topic/queue"

                        }}
                        errors={fields.destination.errors}
                    />
                    <div className={cn("col-span-3", currentBrokerRequireAuth && "col-span-1")}>
                        <Label className={"mb-1"}>Tipo de Broker</Label>
                        <SelectField
                            meta={fields.broker}
                            items={getAllBrokerTypes().map(type => ({
                                name: brokerTypeMetadata[type].label,
                                value: type
                            }))}
                            placeholder={"Tipo de Broker"}
                        />
                    </div>

                    {currentBrokerRequireAuth && <>
                        <Field
                            labelProps={{children: "Usuario"}}
                            inputProps={{
                                type: "text",
                                name: "auth.username",
                                autoComplete: "username",
                                placeholder: "Nombre de usuario",
                                defaultValue: currentSettings.auth?.username || ""
                            }}

                            // @ts-ignore
                            errors={fields["auth.username"].errors}
                        />
                        <Field
                            labelProps={{children: "Contraseña"}}
                            inputProps={{
                                type: "password",
                                name: "auth.password",
                                autoComplete: "password",
                                placeholder: "Contraseña",
                                defaultValue: currentSettings.auth?.password || ""
                            }}
                            // @ts-ignore
                            errors={fields["auth.password"].errors}
                        />

                    </>}
                </div>


                <ErrorList errors={form.errors} id={form.errorId}/>
                {/*<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">*/}
                {/*    <Button*/}
                {/*        onClick={handleTestConnection}*/}
                {/*        variant="outline"*/}
                {/*        className="flex items-center gap-2"*/}
                {/*        disabled={!isValidConnectionString || isTestingConnection}*/}
                {/*    >*/}
                {/*        <Unplug className="h-4 w-4"/>*/}
                {/*        {delayedIsTestingConnection ? "Probando..." : "Probar Conexión"}*/}
                {/*    </Button>*/}

                {/*    <div*/}
                {/*        className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono overflow-hidden text-ellipsis">*/}
                {/*        {connectionString}*/}
                {/*    </div>*/}

                {/*    <ConnectionStatusBadge type={"mqtt"}/>*/}
                {/*</div>*/}

                <div className={"flex justify-center mt-6"}>
                    <StatusButton
                        className={"w-full"}
                        name={"intent"}
                        value={"update-broker-settings"}
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
    );
}