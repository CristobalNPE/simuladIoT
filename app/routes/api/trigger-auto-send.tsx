import {sensorSessionService} from "~/routes/devices/services/sensor-session.server";
import {data} from "react-router";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import {addVarianceToPayload} from "~/routes/devices/utils/payload.utils";
import {sendDeviceData} from "~/routes/devices/services/message-sending.server";
import type {Route} from "./+types/trigger-auto-send";
import {messageHistoryService} from "~/routes/devices/services/message-history.server";

interface TriggerAutoSendRequestBody {
    sensorId: string;
    useRealisticValues: boolean;
}

export async function action({request}: Route.ActionArgs) {
    let responseHeaders = new Headers();

    try {
        const body: TriggerAutoSendRequestBody = await request.json();

        const {sensorId, useRealisticValues} = body;

        const sensor = await sensorSessionService.getSensorById(request, sensorId);

        if (!sensor) {
            console.error(`[AutoSend Action] Sensor ${sensorId} not found in session.`);
            return data({success: false, message: "Sensor not found"}, {status: 404});
        }

        const connectionSettings = sensor.type === "ESP32"
            ? await connectionStorageService.getHttpConnectionSettingsFromRequest(request)
            : await connectionStorageService.getBrokerConnectionSettingsFromRequest(request);

        if (!connectionSettings) {
            console.error(`[AutoSend Action] Connection settings not found for sensor ${sensorId}.`);
            return data({success: false, message: "Connection settings not found"}, {status: 404});
        }

        let payloadObject = sensor.payload;
        if (useRealisticValues) {
            payloadObject = addVarianceToPayload(payloadObject, sensor.category);
        }
        const payloadString = JSON.stringify(payloadObject, null, 2);

        console.log(`[AutoSend Action] Sending data for sensor ${sensorId}...`);
        const sendResult = await sendDeviceData(payloadString, connectionSettings);

        // record history ---------------------------------------
        try {
            const historyResult = await messageHistoryService.addMessageRecord(request, {
                sensorId: sensor.id,
                apiKey: sensor.apiKey,
                payloadSent: payloadObject,
                dataSentResult: sendResult
            });
            //merge headers (history + response)
            historyResult.headers.forEach((value, key) => responseHeaders.append(key, value));
        } catch (historyError) {
            console.error("Failed to record message history:", historyError);
        }

        return data(sendResult, {headers: responseHeaders});

    } catch (error) {
        console.error("[AutoSend Action] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown server error during auto-send trigger";
        return data({success: false, message: "Failed to trigger send", error: message}, {status: 500});
    }

}