import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {SensorDataSent} from "~/routes/devices/schemas/sensor-data.schema";
import {sendMqttMessage} from "~/services/mqtt.service";
import {sensorService} from "~/routes/devices/services/sensor.service";
import {addVarianceToPayload, generateSamplePayload} from "~/routes/devices/utils/payload.utils";


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

    sendDeviceData(data: SensorDataSent): void {
        if (data.sensorType === "ESP32") {
            sendDataViaRest(data);
        } else if (data.sensorType === "ZIGBEE") {
            sendDataViaMqtt(data);
        } else {
            throw new Error(`Unsupported sensor type: ${data.sensorType}`);
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
    }

}

async function sendDataViaRest(data: SensorDataSent): Promise<void> {
    const {endpoint, domain, port, isLocal} = connectionStorageService.getHttpSettings();

    const sanitizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`

    const connectionURL = isLocal
        ? `http://${domain}:${port}${sanitizedEndpoint}`
        : `https://${domain}${sanitizedEndpoint}`

    try {
        await fetch(connectionURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data.sensorData,
        })
    } catch (error) {
        console.error("REST request failed", error)
    }
}


async function sendDataViaMqtt(data: SensorDataSent): Promise<void> {

    const {broker, port, topic} = connectionStorageService.getMqttSettings()

    const payload = data.sensorData
    try {
        await sendMqttMessage({
            broker,
            port,
            topic,
            payload
        })
    } catch (error) {
        console.error("MQTT send failed", error)
    }
}
