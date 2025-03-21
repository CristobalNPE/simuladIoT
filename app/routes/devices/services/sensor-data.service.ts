import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {SensorDataSent, SentDataResult} from "~/routes/devices/schemas/sensor-data.schema";
import {sendMqttMessage} from "~/services/mqtt.service";
import {sensorService} from "~/routes/devices/services/sensor.service";
import {addVarianceToPayload, generateSamplePayload} from "~/routes/devices/utils/payload.utils";
import {messageHistoryService} from "~/routes/devices/services/message-history.service";


interface AutoSendConfig {
    intervalId: NodeJS.Timeout;
    intervalMs: number;
    lastSentAt: number;
}

type AutoSendStatus = {
    enabled: boolean;
    intervalMs?: number;
    lastSentAt?: number;
}

const autoSendConfigs: Record<string, AutoSendConfig> = {};

export const sensorDataService = {

    regenerateSensorPayload(id: string): void {
        const sensor = sensorService.getSensorById(id);

        if (!sensor) {
            console.error(`Sensor not found with id ${id}`)
            return;
        }
        sensor.payload = generateSamplePayload(sensor.category, sensor.apiKey);

        sensorService.updateSensor(sensor);
    },

    async sendDeviceData(data: SensorDataSent): Promise<SentDataResult> {
        try {
            let result: SentDataResult;

            if (data.sensorType === "ESP32") {
                result = await sendDataViaRest(data);
            } else if (data.sensorType === "ZIGBEE") {
                result = await sendDataViaMqtt(data);
            } else {
                throw new Error(`Unsupported sensor type: ${data.sensorType}`);
            }

            const jsonData = JSON.parse(data.sensorData);

            messageHistoryService.createMessageRecord(
                data.sensorId,
                data.apiKey,
                Array.isArray(jsonData) ? jsonData : [jsonData],
                result.status || (result.success ? 200 : 400),
                result.message || (result.success ? "Data sent successfully" : "Failed to send data")
            );



            return result;
        } catch (error) {
            console.error("Failed to send data", error);

            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            messageHistoryService.createMessageRecord(
                data.sensorId,
                data.apiKey,
                [], // empty JSON data since we couldn't parse or send it
                500,
                `Error: ${errorMessage}`
            );

            return {
                success: false,
                payload: data.sensorData,
                status: 500,
                message: errorMessage
            };
        }
    },

    startAutoSend(sensorId: string, intervalMs: number = 5000, useRealisticValues: boolean = false): boolean {
        const sensor = sensorService.getSensorById(sensorId);
        if (!sensor) {
            console.error(`Sensor not found with id ${sensorId}`)
            return false;
        }

        this.stopAutoSend(sensorId); //stop existing intervals if any

        const intervalId = setInterval(() => {

            let payload = sensor.payload

            if (useRealisticValues) {
                payload = addVarianceToPayload(sensor.payload, sensor.category);
            }

            this.sendDeviceData({
                sensorId: sensorId,
                sensorType: sensor.type,
                sensorData: JSON.stringify(payload, null, 2),
                apiKey: sensor.apiKey
            })

            //update last sent in mem
            if (autoSendConfigs[sensorId]) {
                autoSendConfigs[sensorId].lastSentAt = Date.now();
            }

        }, intervalMs)

        //store config
        autoSendConfigs[sensorId] = {
            intervalId,
            intervalMs,
            lastSentAt: Date.now() //initial
        }
        return true;
    },

    stopAutoSend(sensorId: string): boolean {
        const config = autoSendConfigs[sensorId];

        if (!config) {
            return false;
        }

        clearInterval(config.intervalId);
        delete autoSendConfigs[sensorId];
        return true;
    },

    isAutoSendEnabled(sensorId: string): boolean {
        return !!autoSendConfigs[sensorId];
    },

    getAutoSendStatus(sensorId: string): AutoSendStatus {
        const config = autoSendConfigs[sensorId];

        if (!config) {
            return {enabled: false}
        }
        return {
            enabled: true,
            intervalMs: config.intervalMs,
            lastSentAt: config.lastSentAt
        }
    },

    stopAllAutoSend(): void {
        Object.keys(autoSendConfigs).forEach(sensorId => {
            this.stopAutoSend(sensorId);
        });
    },



    getMessageHistory(sensorId: string) {
        return messageHistoryService.getMessageHistoryBySensorId(sensorId);
    },

    clearMessageHistory(sensorId: string) {
        messageHistoryService.clearHistoryForSensor(sensorId);
    },

    clearAllMessageHistory() {
        messageHistoryService.clearAllHistory();
    }
}

async function sendDataViaRest(data: SensorDataSent): Promise<SentDataResult> {
    const {endpoint, domain, port, isLocal} = connectionStorageService.getHttpSettings();

    const sanitizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

    const connectionURL = isLocal
        ? `http://${domain}:${port}${sanitizedEndpoint}`
        : `https://${domain}${sanitizedEndpoint}`

    try {
        const response = await fetch(connectionURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data.sensorData,
        });

        const responseText = await response.text();
        let responseMessage;

        try {
            const jsonResponse = JSON.parse(responseText);
            responseMessage = jsonResponse.message || responseText;
        } catch {
            responseMessage = responseText || (response.ok ? "Success" : "Error");
        }

        return {
            success: response.ok,
            payload: data.sensorData,
            status: response.status,
            message: responseMessage
        };
    } catch (error) {
        console.error("REST request failed", error);
        return {
            success: false,
            payload: data.sensorData,
            status: 0,
            message: error instanceof Error ? error.message : "Network error"
        };
    }
}


async function sendDataViaMqtt(data: SensorDataSent): Promise<SentDataResult> {
    const {broker, port, topic} = connectionStorageService.getMqttSettings();
    const payload = data.sensorData;

    try {
        await sendMqttMessage({
            broker,
            port,
            topic,
            payload
        });

        return {
            success: true,
            payload: data.sensorData,
            status: 200,
            message: "MQTT message sent successfully"
        };
    } catch (error) {
        console.error("MQTT send failed", error);
        return {
            success: false,
            payload: data.sensorData,
            status: 0,
            message: error instanceof Error ? error.message : "MQTT error"
        };
    }
}