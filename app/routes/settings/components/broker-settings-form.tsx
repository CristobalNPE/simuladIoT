import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {ErrorList, Field, SelectField} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import React, {useEffect, useRef} from "react";
import {brokerRequiresAuth, type BrokerType, brokerTypeMetadata, getAllBrokerTypes} from "~/types/broker.types";
import {Label} from "~/components/ui/label";
import {cn} from "~/lib/utils";
import type {action} from "~/routes/settings/settings";
import {ConnectionTestResult} from "~/routes/settings/components/connection-test-result";
import type {TestConnectionResult} from "~/routes/api/types/connection-test.types";
import {isSubmissionResult} from "~/utils/conform-utils";
import {toast} from "sonner";


export function BrokerSettingsForm({currentSettings}: { currentSettings: BrokerConnectionSettings }) {
    const saveFetcher = useFetcher<typeof action>(({key: "broker-connection-settings"}))
    const testFetcher = useFetcher<TestConnectionResult>({key: "broker-test-connection"})

    const isSaving = saveFetcher.state !== "idle"
    const isTesting = testFetcher.state !== "idle"

    const lastResult = !isSaving && isSubmissionResult(saveFetcher.data) ? saveFetcher.data : null;

    const formRef = useRef<HTMLFormElement>(null);

    const [form, fields] = useForm({
        id: `broker-connection-settings-form`,
        constraint: getZodConstraint(BrokerConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: lastResult,
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

    //toast
    useEffect(() => {
        if (saveFetcher.state === "idle" && saveFetcher.data?.status === "success") {
            toast.success("Configuración del Broker guardada correctamente.");
        }
    }, [saveFetcher.state, saveFetcher.data]);


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
                            placeholder={"Seleccione  Broker"}
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
                <ConnectionTestResult handleTestConnection={handleTestConnection}
                                      isTesting={isTesting}
                                      isSaving={isSaving}
                                      testResult={testFetcher.data}
                />

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