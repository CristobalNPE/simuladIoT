import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import {formatJSONMessage} from "~/utils/format.utils";

interface PayloadTabProps {
    deviceId: string
    customPayload: string
    setCustomPayload: (value: string) => void
}

export function PayloadTab({ deviceId, customPayload, setCustomPayload }: PayloadTabProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={`payload-${deviceId}`}>JSON Payload</Label>
            <Textarea
                id={`payload-${deviceId}`}
                value={formatJSONMessage(customPayload)}
                onChange={(e) => setCustomPayload(e.target.value)}
                className="font-mono text-sm h-[200px]"
            />
        </div>
    )
}