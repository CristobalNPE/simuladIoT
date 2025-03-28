import {type HttpConnectionSettings, HttpConnectionSettingsSchema} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {ErrorList, Field} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import React, {useRef} from "react";
import type {action} from "~/routes/settings/settings";
import {Button} from "~/components/ui/button";
import {Unplug} from "lucide-react";
import {cn} from "~/lib/utils";

type TestConnectionResult = { success: boolean; message: string };

export function HttpSettingsForm({currentSettings}: { currentSettings: HttpConnectionSettings }) {
    const saveFetcher = useFetcher<typeof action>(({key: "http-connection-settings"}))
    const testFetcher = useFetcher<TestConnectionResult>({key: "http-test-connection"})

    const isSaving = saveFetcher.state !== "idle"
    const isTesting = testFetcher.state !== "idle"

    const formRef = useRef<HTMLFormElement>(null);

    const [form, fields] = useForm({
        id: `http-connection-settings-form`,
        constraint: getZodConstraint(HttpConnectionSettingsSchema),
        defaultValue: {
            ...currentSettings
        },
        lastResult: !isSaving ? saveFetcher.data?.result : null,
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


    // useSuccessToast(saveFetcher, "Configuración HTTP guardada correctamente.")

    return (
        <>
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