import {CreateSensorSchema, type SensorType} from "~/routes/devices/schemas/sensor.schema";
import {href, useFetcher} from "react-router";
import {getFormProps, getInputProps, type SubmissionResult, useForm} from "@conform-to/react";
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
import type {action} from "~/routes/devices/devices";
import type {SensorCategory} from "~/routes/devices/schemas/sensor-types.schema";

interface CreateSensorDialogProps {
    type: SensorType,
    children: React.ReactNode
}

function isSubmissionResult(data: any): data is SubmissionResult<any> {
    return data != null && typeof data === 'object' && ('status' in data || 'error' in data || 'value' in data || 'intent' in data);
}

const DEFAULT_SENSOR_CATEGORY: SensorCategory = 'temperature';

export function CreateSensorDialog({type, children}: CreateSensorDialogProps) {

    const fetcher = useFetcher<typeof action>({key: "create-sensor"})
    const isPending = fetcher.state !== "idle";

    const lastResult = !isPending && isSubmissionResult(fetcher.data) ? fetcher.data : null;

    const [form, fields] = useForm({
        id: `create-sensor-form`,
        constraint: getZodConstraint(CreateSensorSchema),
        defaultValue: {
            sensorType: type,
            category: DEFAULT_SENSOR_CATEGORY
        },
        lastResult: lastResult,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: CreateSensorSchema})
        },
        shouldRevalidate: "onBlur",
    })

    const shouldClose = lastResult?.status === "success" && !isPending;
    const [open, setOpen] = useDialogAutoClose(shouldClose)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Dispositivo</DialogTitle>
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
                            className={""}
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
                        <div className={""}>
                            <Label htmlFor={fields.category.id} className=" mb-1">
                                Categoría
                            </Label>
                            <SelectField
                                meta={fields.category}
                                items={getSensorCategories()}
                                placeholder={"Seleccione una categoría"}
                            />
                        </div>
                        <input type="hidden" name="sensorType" value={type}/>
                    </div>
                    <ErrorList errors={form.errors} id={form.errorId}/>
                    <StatusButton
                        className={"w-full"}
                        name={"intent"}
                        value={"create-sensor"}
                        form={form.id}
                        status={isPending ? "pending" : form.status ?? "idle"}
                        type="submit"
                        disabled={isPending}
                    >
                        {`Agregar Dispositivo ${type}`}
                    </StatusButton>

                </fetcher.Form>
            </DialogContent>
        </Dialog>
    )
}