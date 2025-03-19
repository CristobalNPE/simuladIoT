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
    message?: string
    updatedPayload?: string
}

export async function sendDeviceData({
                                         payload,
                                         sensorApiKey,
                                         connectionConfig,
                                         restEndpoint,
                                         mqttEndpoint
                                     }: SendDataParams): Promise<SendDataResult> {
    try {
        const prepared = preparePayloadForSending(payload, sensorApiKey)

        if (!prepared.valid) {
            return {
                success: false,
                payload: payload,
                message: prepared.error || "Invalid payload",
                status: 400,
                updatedPayload: undefined
            }
        }

        const preparedPayloadString = JSON.stringify(prepared.payload)

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
            message: error instanceof Error ? error.message : "Unknown error",
            status: 500,
            updatedPayload: undefined
        }
    }
}

async function sendRestData(payload: string, endpoint: string): Promise<SendDataResult> {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: payload,
        })

        // try to get more detailed error message if available
        let errorMessage = "";
        try {
            const responseData = await response.clone().json();
            if (responseData.message || responseData.error) {
                errorMessage = responseData.message || responseData.error;
            }
        } catch {
            // if we can't parse the response as JSON, use status text
            errorMessage = response.statusText;
        }

        return {
            success: response.ok,
            payload: payload,
            status: response.status,
            message: response.ok ? "Solicitud completada exitosamente" : errorMessage || `Error ${response.status}`,
            updatedPayload: payload
        }
    } catch (error) {
        console.error("REST request failed", error)
        return {
            success: false,
            payload: payload,
            message: error instanceof Error ? error.message : "REST request failed",
            status: 500

        }
    }
}

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
            message: "Mensaje MQTT enviado correctamente",
            status: 200,
            updatedPayload: payload
        }
    } catch (error) {
        console.error("MQTT send failed", error)
        return {
            success: false,
            payload: payload,
            message: error instanceof Error ? error.message : "MQTT send failed",
            status: 500
        }
    }
}