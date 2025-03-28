import {type HttpConnectionSettings, HttpConnectionSettingsSchema} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {ErrorList, Field} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import React, {useEffect, useRef} from "react";
import type {action} from "~/routes/settings/settings";
import {ConnectionTestResult} from "~/routes/settings/components/connection-test-result";
import type {TestConnectionResult} from "~/routes/api/types/connection-test.types";
import {isSubmissionResult} from "~/utils/conform-utils";
import {toast} from "sonner";
import {Alert, AlertDescription} from "~/components/ui/alert";
import { AlertCircle } from "lucide-react";


export function HttpSettingsForm({currentSettings, isDefault}: {
    currentSettings: HttpConnectionSettings | null | undefined,
    isDefault: boolean
}) {

    const saveFetcher = useFetcher<typeof action>(({key: "http-connection-settings"}))
    const testFetcher = useFetcher<TestConnectionResult>({key: "http-test-connection"})

    const isSaving = saveFetcher.state !== "idle"
    const isTesting = testFetcher.state !== "idle"

    const lastResult = !isSaving && isSubmissionResult(saveFetcher.data) ? saveFetcher.data : null;

    const formRef = useRef<HTMLFormElement>(null);

    const [form, fields] = useForm({
        id: `http-connection-settings-form`,
        constraint: getZodConstraint(HttpConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: lastResult,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: HttpConnectionSettingsSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const handleTestConnection = () => {
        if (!formRef.current) return;

        const formData = new FormData(formRef.current);
        formData.set("connectionType", "http");

        testFetcher.submit(formData, {
            method: "post",
            action: "/api/test-connection",
        });
    }


    //toast
    useEffect(() => {
        if (saveFetcher.state === "idle" && saveFetcher.data?.status === "success") {
            toast.success("Configuración HTTP guardada correctamente.");
        }
    }, [saveFetcher.state, saveFetcher.data]);

    return (
        <>
            {isDefault && (
                <Alert variant="default" className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50">
                    <AlertCircle className="h-4 w-4 !text-yellow-800 dark:!text-yellow-300" />
                    {/* <AlertTitle>Atención</AlertTitle> */}
                    <AlertDescription className="text-xs">
                        Estás viendo la configuración por defecto. Guarda tus propios ajustes para asegurar la conexión y crear dispositivos.
                    </AlertDescription>
                </Alert>
            )}
            <saveFetcher.Form
                ref={formRef}
                action={href("/settings")}
                method={"POST"}
                {...getFormProps(form)}

            >
                <Field className={"col-span-2"}
                       labelProps={{children: "String de Conexión"}}
                       inputProps={{
                           ...getInputProps(fields.connectionString, {type: "text"}),
                           autoComplete: "http-connection-string",
                           placeholder: "ej., http://localhost:8080/api/v1/sensor_data",


                       }}
                       errors={fields.connectionString.errors}
                />
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
                        value={"update-http-settings"}
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
    )
}