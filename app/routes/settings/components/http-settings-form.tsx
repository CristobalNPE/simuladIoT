import {type HttpConnectionSettings, HttpConnectionSettingsSchema} from "~/routes/settings/schemas/connection.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {ErrorList, Field} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import React from "react";
import type {action} from "~/routes/settings/settings";

export function HttpSettingsForm({currentSettings}: { currentSettings: HttpConnectionSettings }) {
    const fetcher = useFetcher<typeof action>(({key: "http-connection-settings"}))
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


    // useSuccessToast(fetcher, "Configuración HTTP guardada correctamente.")

    return (
        <>
            <fetcher.Form
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

                {/*    <ConnectionStatusBadge type={"http"}/>*/}
                {/*</div>*/}

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