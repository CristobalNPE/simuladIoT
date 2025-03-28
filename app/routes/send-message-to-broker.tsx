import type {Route} from "./+types/send-message-to-broker";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {SensorType} from "~/routes/devices/schemas/sensor.schema";
import {sendDeviceData} from "~/routes/devices/services/message-sending.server";
import {data} from "react-router";
import {sensorSessionService} from "./devices/services/sensor-session.server";
import {messageHistoryService} from "~/routes/devices/services/message-history.server";


interface ManualSendFormData {
    payload: string;
    sensorType: SensorType;
    sensorId: string;
}

export async function action({request}: Route.ActionArgs) {

    const formData = await request.formData();

    const payloadString = formData.get("payload") as string | null;
    const sensorType = formData.get("sensorType") as SensorType | null;
    const sensorId = formData.get("sensorId") as string | null;

    let responseHeaders = new Headers();

    if (!payloadString || !sensorType || !sensorId) {
        return data({
            success: false,
            message: "Missing required form data (payload, sensorType, sensorId)."
        }, {status: 400});
    }

    let payloadObject: any;

    try {
        payloadObject = JSON.parse(payloadString);
    } catch (e) {
        return data({success: false, message: "Invalid JSON format in payload."}, {status: 400});
    }

    try {
        const sensor = await sensorSessionService.getSensorById(request, sensorId);
        if (!sensor) {
            return data({success: false, message: `Sensor with ID ${sensorId} not found.`}, {status: 404});
        }
        if (sensor.type !== sensorType) {
            return data({success: false, message: `Sensor type mismatch.`}, {status: 400});
        }

        let connectionSettings;
        switch (sensorType) {
            case "ESP32": {
                connectionSettings = await connectionStorageService.getHttpConnectionSettingsFromRequest(request);
                if (!connectionSettings) throw new Error("HTTP connection settings not found.");
                break;
            }
            case "ZIGBEE": {
                connectionSettings = await connectionStorageService.getBrokerConnectionSettingsFromRequest(request);
                if (!connectionSettings) throw new Error("Broker connection settings not found.");
                break;
            }
            default: {
                // should be caught by initial validation
                throw new Error(`Unsupported sensor type: ${sensorType}`);
            }
        }

        const sendResult = await sendDeviceData(payloadString, connectionSettings);

        try {
            const historyResult = await messageHistoryService.addMessageRecord(request, {
                sensorId: sensor.id,
                apiKey: sensor.apiKey,
                payloadSent: payloadObject,
                dataSentResult: sendResult
            });
            // merge headers
            historyResult.headers.forEach((value, key) => responseHeaders.append(key, value));
        } catch (historyError) {
            console.error("Failed to record message history for manual send:", historyError);
        }


        return data(sendResult, {headers: responseHeaders});

    } catch (error) {
        console.error("Error during manual send action:", error);
        const message = error instanceof Error ? error.message : "Unknown server error during manual send.";
        return data({success: false, message: message}, {status: 500});
    }
}
