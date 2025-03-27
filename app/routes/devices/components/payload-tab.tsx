import React from "react";
import {href, useFetcher} from "react-router";
import type {clientAction} from "~/routes/devices/devices";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {getFormProps, useForm} from "@conform-to/react";
import {ErrorList} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import {RefreshCw, Send} from "lucide-react";
import type {SensorType} from "~/routes/devices/schemas/sensor.schema";
import {sensorDataSentSchema} from "~/routes/devices/schemas/sensor-data.schema";
import type {SensorPayload} from "../schemas/sensor-types.schema";
import {PayloadDisplay} from "./payload-display";

interface PayloadTabProps {
    sensorId: string
    sensorType: SensorType
    apiKey: string
    payload: SensorPayload
}

export function PayloadTab({sensorId, sensorType, apiKey, payload}: PayloadTabProps) {

    const fetcher = useFetcher<typeof clientAction>({key: `send-payload-${sensorId}`})
    const isPending = fetcher.state !== "idle";

    const [form, fields] = useForm({
        id: `device-send-payload-form-${sensorId}`,
        constraint: getZodConstraint(sensorDataSentSchema),
        defaultValue: {
            sensorId,
            apiKey,
            sensorType,
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: sensorDataSentSchema})
        },
        shouldRevalidate: "onBlur",
    })


    return (
        <>
            <PayloadDisplay sensorId={sensorId} payload={payload}/>
            <fetcher.Form
                action={href("/devices")}
                method={"POST"}
                {...getFormProps(form)}
            >
                <input type={"hidden"} name={"sensorData"} value={JSON.stringify(payload, null, 2)}/>
                <input type={"hidden"} name={"sensorId"} value={sensorId}/>
                <input type={"hidden"} name={"sensorType"} value={sensorType}/>
                <input type={"hidden"} name={"apiKey"} value={apiKey}/>
                <ErrorList errors={form.errors} id={form.errorId}/>
            </fetcher.Form>
            <div className={"flex gap-2 justify-between"}>
                <StatusButton
                    variant={"outline"}
                    name={"intent"}
                    form={form.id}
                    value={"regenerate-device-payload"}
                    status={isPending ? "pending" : form.status ?? "idle"}
                    type="submit"
                    disabled={isPending}
                >
                    <RefreshCw className="inline-flex mr-4"/>
                    Regenerar
                </StatusButton>
                <StatusButton
                    name={"intent"}
                    value={"send-device-payload"}
                    form={form.id}
                    status={isPending ? "pending" : form.status ?? "idle"}
                    type="submit"
                    disabled={isPending}
                >
                    <Send className="inline-flex mr-4"/>
                    Enviar Datos
                </StatusButton>
            </div>
        </>
    )
}

