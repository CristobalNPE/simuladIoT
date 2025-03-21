import React from "react";
import {href, useFetcher} from "react-router";
import type {clientAction} from "~/routes/devices/devices";
import {getZodConstraint, parseWithZod} from "@conform-to/zod";
import {getFormProps, getTextareaProps, useForm} from "@conform-to/react";
import {ErrorList, TextareaField} from "~/components/forms";
import {StatusButton} from "~/components/ui/status-button";
import {RefreshCw, Send} from "lucide-react";
import type {SensorType} from "~/routes/devices/schemas/sensor.schema";
import {sensorDataSentSchema} from "~/routes/devices/schemas/sensor-data.schema";
import type {SensorPayload} from "../schemas/sensor-types.schema";

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
            // sensorData: JSON.stringify(payload, null, 2)
        },
        lastResult: !isPending ? fetcher.data?.result : null,
        onValidate({formData}) {
            return parseWithZod(formData, {schema: sensorDataSentSchema})
        },
        shouldRevalidate: "onBlur",
    })


    return (
        <>
            <fetcher.Form
                action={href("/devices")}
                method={"POST"}
                {...getFormProps(form)}
            >
                <TextareaField
                    labelProps={{children: "JSON Payload"}}
                    textareaProps={{
                        className: "font-mono text-sm h-[200px]",
                        ...getTextareaProps(fields.sensorData),
                        value: JSON.stringify(payload, null, 2),
                    }}
                />
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


    return <pre>{JSON.stringify(payload, null, 2)}</pre>


    // const [editingValue, setEditingValue] = useState(customPayload)
    // const [isValid, setIsValid] = useState(true)
    //
    // useEffect(() => {
    //     setEditingValue(customPayload)
    //     validateJSON(customPayload)
    // }, [customPayload])
    //
    // const validateJSON = (value: string) => {
    //     try {
    //         JSON.parse(value)
    //         setIsValid(true)
    //         formatJSONMessage(value)
    //         return true
    //     } catch (e) {
    //         setIsValid(false)
    //         return false
    //     }
    // }
    //
    // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    //     const newValue = e.target.value
    //     setEditingValue(newValue)
    //     validateJSON(newValue) // If i decide to validate on change
    // }
    //
    // const handleBlur = () => {
    //     const valid = validateJSON(editingValue)
    //     if (valid) {
    //         // Only format and update if valid
    //         const formatted = formatJSONMessage(editingValue)
    //         setCustomPayload(formatted)
    //         setEditingValue(formatted)
    //     }
    // }
    //
    // return (
    //     <div className="space-y-2">
    //         <div className="flex justify-between items-center">
    //             <Label htmlFor={`payload-${deviceId}`}>JSON Payload</Label>
    //             {!isValid && (
    //                 <div className="flex items-center text-destructive text-xs">
    //                     <AlertCircle size={14} className="mr-1"/>
    //                     <span>JSON Inválido </span>
    //                 </div>
    //             )}
    //         </div>
    //         <Textarea
    //             id={`payload-${deviceId}`}
    //             value={editingValue}
    //             onChange={handleChange}
    //             onBlur={handleBlur}
    //             className={`font-mono text-sm h-[200px] ${!isValid ? 'border-destructive focus:ring-destructive' : ''}`}
    //         />
    //         {!isValid && (
    //             <p className="text-xs text-destructive">
    //                 El JSON no es válido. Por favor, corrígelo antes de enviar los datos.
    //             </p>
    //         )}
    //     </div>
    // )
}