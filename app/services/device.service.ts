import type {ConnectionConfig, MqttConnection, RestConnection} from "~/types/connection.types"
import {preparePayloadForSending} from "~/utils/payload.utils";
import {sendMqttMessage} from "./mqtt.service";

interface SendDataParams {
    deviceId: string
    payload: string
    sensorApiKey: string
    connectionConfig: ConnectionConfig
    restEndpoint: string
    mqttEndpoint: string
}

interface SendDataResult {
    success: boolean
    payload: string
    status?: number
    error?: string
    updatedPayload?: string
}

export async function sendDeviceData({
                                         deviceId,
                                         payload,
                                         sensorApiKey,
                                         connectionConfig,
                                         restEndpoint,
                                         mqttEndpoint
                                     }: SendDataParams): Promise<SendDataResult> {
    try {
        // Prepare and validate the payload
        const prepared = preparePayloadForSending(payload, sensorApiKey)

        if (!prepared.valid) {
            return {
                success: false,
                payload: payload,
                error: prepared.error || "Invalid payload",
                status: 400,
                updatedPayload: undefined
            }
        }

        const preparedPayloadString = JSON.stringify(prepared.payload)

        // Send via REST or MQTT depending on connection type
        if (connectionConfig.connectionType === 'rest') {
            const restConfig = connectionConfig as RestConnection
            return await sendRestData(preparedPayloadString, restEndpoint)
        } else {
            const mqttConfig = connectionConfig as MqttConnection
            return await sendMqttData(preparedPayloadString, mqttConfig, mqttEndpoint)
        }
    } catch (error) {
        console.error("Error sending data", error)
        return {
            success: false,
            payload: payload,
            error: error instanceof Error ? error.message : "Unknown error",
            status: 500,
            updatedPayload: undefined
        }
    }
}

// REST API data sending
async function sendRestData(payload: string, endpoint: string): Promise<SendDataResult> {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: payload,
        })

        return {
            success: response.ok,
            payload: payload,
            status: response.status,
            updatedPayload: payload
        }
    } catch (error) {
        console.error("REST request failed", error)
        return {
            success: false,
            payload: payload,
            error: error instanceof Error ? error.message : "REST request failed",
            status: 500
        }
    }
}

// MQTT data sending (via the MQTT service)
async function sendMqttData(
    payload: string,
    mqttConfig: MqttConnection,
    endpoint: string
): Promise<SendDataResult> {
    try {
        await sendMqttMessage({
            broker: mqttConfig.broker,
            port: mqttConfig.port,
            topic: mqttConfig.topic || endpoint,
            payload
        })

        return {
            success: true,
            payload: payload,
            updatedPayload: payload
        }
    } catch (error) {
        console.error("MQTT send failed", error)
        return {
            success: false,
            payload: payload,
            error: error instanceof Error ? error.message : "MQTT send failed"
        }
    }
}