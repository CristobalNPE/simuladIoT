import {Label} from "~/components/ui/label"
import {Textarea} from "~/components/ui/textarea"
import {useEffect, useState} from "react";
import {AlertCircle} from "lucide-react";
import {formatJSONMessage} from "~/utils/format.utils";

interface PayloadTabProps {
    disabled: boolean
    deviceId: string
    customPayload: string
    setCustomPayload: (value: string) => void
}

export function PayloadTab({disabled, deviceId, customPayload, setCustomPayload}: PayloadTabProps) {
    const [editingValue, setEditingValue] = useState(customPayload)
    const [isValid, setIsValid] = useState(true)

    useEffect(() => {
        setEditingValue(customPayload)
        validateJSON(customPayload)
    }, [customPayload])

    const validateJSON = (value: string) => {
        try {
            JSON.parse(value)
            setIsValid(true)
            formatJSONMessage(value)
            return true
        } catch (e) {
            setIsValid(false)
            return false
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setEditingValue(newValue)
        validateJSON(newValue) // If i decide to validate on change
    }

    const handleBlur = () => {
        const valid = validateJSON(editingValue)
        if (valid) {
            // Only format and update if valid
            const formatted = formatJSONMessage(editingValue)
            setCustomPayload(formatted)
            setEditingValue(formatted)
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={`payload-${deviceId}`}>JSON Payload</Label>
                {!isValid && (
                    <div className="flex items-center text-destructive text-xs">
                        <AlertCircle size={14} className="mr-1"/>
                        <span>JSON Inválido </span>
                    </div>
                )}
            </div>
            <Textarea
                disabled={disabled}
                id={`payload-${deviceId}`}
                value={editingValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`font-mono text-sm h-[200px] ${!isValid ? 'border-destructive focus:ring-destructive' : ''}`}
            />
            {!isValid && (
                <p className="text-xs text-destructive">
                    El JSON no es válido. Por favor, corrígelo antes de enviar los datos.
                </p>
            )}
        </div>
    )
}