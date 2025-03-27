import type {SensorPayload} from "~/routes/devices/schemas/sensor-types.schema";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {ScrollArea} from "~/components/ui/scroll-area";
import {Edit, PenBox} from "lucide-react";
import React from "react";
import {ErrorList, TextareaField} from "~/components/forms";
import {href, useFetcher} from "react-router";
import type {clientAction} from "~/routes/devices/devices";
import {getFormProps, getTextareaProps, useForm} from "@conform-to/react";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {sensorModifyPayloadSchema} from "~/routes/devices/schemas/sensor-data.schema";
import {StatusButton} from "~/components/ui/status-button";

export function PayloadDisplay({payload, sensorId}: { payload: SensorPayload, sensorId: string }) {

    const fetcher = useFetcher<typeof clientAction>({key: `modify-payload-${sensorId}`})
    const isPending = fetcher.state !== "idle";


    const [form, fields] = useForm({
        id: `device-modify-payload-form-${sensorId}`,
        constraint: getZodConstraint(sensorModifyPayloadSchema),
        defaultValue: {
            sensorId,
            sensorData: JSON.stringify(payload, null, 2)
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: sensorModifyPayloadSchema})
        },
        shouldRevalidate: "onInput",
    })

    return (
        <Dialog>
            <DialogTrigger asChild>
                <ScrollArea
                    className={"h-[240px] mb-6 bg-green-300 w-full bg-secondary rounded-md shadow-sm border hover:border-primary/50 select-none p-1 py-3  relative group transition-all duration-150"}>
                    <pre className={"tracking-tight text-sm  hover:cursor-pointer text-left"}>
                        {JSON.stringify(payload, null, 2)}
                    </pre>
                    <Edit size={18}
                          className={"absolute right-2 top-2 text-primary opacity-0 group-hover:opacity-100 transition-all duration-150"}/>
                </ScrollArea>
            </DialogTrigger>
            <DialogContent className={"sm:max-w-3xl"}>
                <DialogHeader>
                    <DialogTitle>Modificar Payload</DialogTitle>
                    <DialogDescription>
                        Puedes modificar el payload manualmente. Asegurate de que el formato sea correcto y corresponda
                        a lo que espera tu API.
                    </DialogDescription>
                </DialogHeader>

                <fetcher.Form
                    action={href("/devices")}
                    method={"POST"}
                    {...getFormProps(form)}

                >
                    <TextareaField
                        errors={fields.sensorData.errors}
                        labelProps={{children: ""}}
                        textareaProps={{
                            className: "font-mono text-sm h-[400px]",
                            ...getTextareaProps(fields.sensorData),
                        }}
                    />
                    <input type={"hidden"} name={"sensorId"} value={sensorId}/>
                    <ErrorList errors={form.errors} id={form.errorId}/>
                </fetcher.Form>
                <DialogFooter>
                    <StatusButton
                        name={"intent"}
                        value={"modify-device-payload"}
                        form={form.id}
                        status={isPending ? "pending" : form.status ?? "idle"}
                        type="submit"
                        disabled={isPending}
                    >
                        <PenBox className="inline-flex mr-4"/>
                        Aplicar Cambios
                    </StatusButton>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}