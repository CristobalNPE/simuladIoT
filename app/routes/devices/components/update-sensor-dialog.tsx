import {type Sensor, UpdateSensorSchema} from "~/routes/devices/schemas/sensor.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog"
import React from "react";
import {ErrorList, Field, SelectField} from "~/components/forms";
import {getSensorCategories} from "~/routes/devices/utils/sensor.utils";
import {Label} from "~/components/ui/label";
import {StatusButton} from "~/components/ui/status-button";
import {useDialogAutoClose} from "~/hooks/use-dialog-autoclose";
import type {clientAction} from "~/routes/devices/devices";

interface UpdateSensorDialogProps {
    sensor: Sensor,
    children: React.ReactNode
}

export function UpdateSensorDialog({sensor, children}: UpdateSensorDialogProps) {

    const fetcher = useFetcher<typeof clientAction>({key: `update-sensor-${sensor.id}`})
    const isPending = fetcher.state !== "idle";


    const [form, fields] = useForm({
        id: `update-sensor-form-${sensor.id}`,
        constraint: getZodConstraint(UpdateSensorSchema),
        defaultValue: {
            id: sensor.id,
            name: sensor.name,
            apiKey: sensor.apiKey,
            sensorType: sensor.type,
            measurementsCount: sensor.measurementsCount,
            category: sensor.category
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: UpdateSensorSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const shouldClose = fetcher.data?.result?.status === "success" && !isPending;
    const [open,setOpen] = useDialogAutoClose(shouldClose)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modificar Dispositivo</DialogTitle>
                    <DialogDescription>
                        Personaliza la configuración de tu dispositivo IoT
                    </DialogDescription>
                </DialogHeader>

                <fetcher.Form
                    action={href("/devices")}
                    method={"POST"}
                    {...getFormProps(form)}
                >
                    <div className={"mb-6"}>
                        <Field
                            labelProps={{children: "Nombre"}}
                            inputProps={{
                                ...getInputProps(fields.name, {type: "text"}),
                                autoComplete: "device-name",
                                placeholder: "Nombre del dispositivo"
                            }}
                            errors={fields.name.errors}
                        />
                        <Field
                            labelProps={{children: "API Key"}}
                            inputProps={{
                                ...getInputProps(fields.apiKey, {type: "text"}),
                                autoComplete: "device-api-key",
                                placeholder: "TU_API_KEY",
                                autoFocus: true,
                                onFocus: (e) => e.target.select()
                            }}
                            errors={fields.apiKey.errors}
                        />
                        <div className={"grid grid-cols-3 gap-4"}>
                            <div className={"col-span-2"}>
                                <Label htmlFor={fields.category.id} className=" mb-1">
                                    Categoría
                                </Label>
                                <SelectField
                                    meta={fields.category}
                                    items={getSensorCategories()}
                                    placeholder={"Seleccione una categoría"}
                                />
                            </div>
                            <Field
                                help={"Cantidad de mediciones enviadas en un mismo payload"}
                                labelProps={{children: "Mediciones"}}
                                inputProps={{
                                    ...getInputProps(fields.measurementsCount, {type: "number"}),
                                    autoComplete: "device-measurements-count",
                                }}
                                errors={fields.measurementsCount.errors}
                            />
                        </div>
                        <input type="hidden" name="sensorType" value={sensor.type}/>
                        <input type="hidden" name="id" value={sensor.id}/>
                    </div>
                    <ErrorList errors={form.errors} id={form.errorId}/>
                    <StatusButton
                        className={"w-full"}
                        name={"intent"}
                        value={"update-sensor"}
                        form={form.id}
                        status={isPending ? "pending" : form.status ?? "idle"}
                        type="submit"
                        disabled={isPending}
                    >
                        {`Modificar Dispositivo ${sensor.type}`}
                    </StatusButton>

                </fetcher.Form>
            </DialogContent>
        </Dialog>
    )
}