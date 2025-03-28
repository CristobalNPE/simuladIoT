import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {ErrorList, Field, SelectField} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import React, {useRef} from "react";
import {brokerRequiresAuth, type BrokerType, brokerTypeMetadata, getAllBrokerTypes} from "~/types/broker.types";
import {Label} from "~/components/ui/label";
import {cn} from "~/lib/utils";
import type {action} from "~/routes/settings/settings";
import {Unplug} from "lucide-react";
import {Button} from "~/components/ui/button";

type TestConnectionResult = { success: boolean; message: string };

export function BrokerSettingsForm({currentSettings}: { currentSettings: BrokerConnectionSettings }) {
    const saveFetcher = useFetcher<typeof action>(({key: "broker-connection-settings"}))
    const testFetcher = useFetcher<TestConnectionResult>({key: "broker-test-connection"})

    const isSaving = saveFetcher.state !== "idle"
    const isTesting = testFetcher.state !== "idle"

    const formRef = useRef<HTMLFormElement>(null);

    const [form, fields] = useForm({
        id: `broker-connection-settings-form`,
        constraint: getZodConstraint(BrokerConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: !isSaving ? saveFetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: BrokerConnectionSettingsSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const currentBrokerRequireAuth = fields.broker.value ? brokerRequiresAuth(fields.broker.value as BrokerType) : false;

    const handleTestConnection = () => {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        formData.set("connectionType", "broker");

        testFetcher.submit(formData, {
            method: "post",
            action: "/api/test-connection",
        });
    }


    // useSuccessToast(saveFetcher, "Configuración del Broker guardada correctamente.") // todo: make toast work server side

    return (
        <>
            <saveFetcher.Form
                ref={formRef}
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
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center my-4">
                    <Button
                        type="button"
                        onClick={handleTestConnection}
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isTesting || isSaving}
                    >
                        <Unplug className="h-4 w-4" />
                        {isTesting ? "Probando..." : "Probar Conexión"}
                    </Button>

                    {testFetcher.data && !isTesting && (
                        <div className={cn(
                            "px-3 py-1 rounded text-sm",
                            testFetcher.data.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                            {testFetcher.data.message}
                        </div>
                    )}
                </div>

                <div className={"flex justify-center mt-6"}>
                    <StatusButton
                        className={"w-full"}
                        name={"intent"}
                        value={"update-broker-settings"}
                        form={form.id}
                        status={isSaving ? "pending" : form.status ?? "idle"}
                        type="submit"
                        disabled={isSaving}
                    >
                        Guardar Configuración
                    </StatusButton>
                </div>
            </saveFetcher.Form>
        </>
    );
}