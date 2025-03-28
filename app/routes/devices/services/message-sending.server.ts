import {
    type BrokerConnectionSettings,
    type ConnectionSettings,
    type HttpConnectionSettings,
    isBrokerConnectionSettings,
    isHttpConnectionSettings
} from "~/routes/settings/schemas/connection.schema";
import {createProducer} from "~/services/producer.factory";
import type {MessageProducer, ProducerConfig} from "~/services/producer.interface";

export type DataSentResult = {
    success: boolean;
    message: string;
    error?: string;
};

async function sendDataViaRest(data: string, httpSettings: HttpConnectionSettings): Promise<DataSentResult> {
    const {connectionString} = httpSettings;
    console.log(`Attempting REST POST to: ${connectionString}`);

    try {
        const response = await fetch(connectionString, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`REST request failed with status ${response.status}: ${errorBody}`);
            throw new Error(`Request failed with status ${response.status}`);
        }

        console.log(`REST POST successful to: ${connectionString}`);
        return {
            success: true,
            message: `Message sent successfully via http-rest!`,
        };
    } catch (error: any) {
        console.error("🔴 REST request failed", error);
        let errorMessage = `Failed operation via http-rest. Error: ${error.message}`;
        return {
            success: false,
            message: "Failed operation via http-rest.",
            error: errorMessage,
        };
    }
}

async function sendDataToBroker(payload: string, brokerSettings: BrokerConnectionSettings): Promise<DataSentResult> {
    const {broker, connectionString, destination, auth} = brokerSettings;
    console.log(`Attempting broker send via ${broker} to: ${destination} on ${connectionString}`);

    const config: ProducerConfig = {
        connectionString,
        username: auth?.username,
        password: auth?.password,
    };

    let producer: MessageProducer | null = null;
    try {
        producer = createProducer(broker, config); // Uses Buffer etc. - SAFE on server

        await producer.connect();
        console.log(`Broker ${broker} connected.`);
        await producer.sendMessage(destination, payload);
        console.log(`Broker ${broker} message sent to ${destination}.`);

        return {
            success: true,
            message: `Message sent successfully via ${broker}!`,
        };
    } catch (error: any) {
        console.error(`🔴 Failed operation via ${broker}:`, error);
        let errorMessage = `Failed operation via ${broker}. Error: ${error.message}`;
        return {
            success: false,
            message: `Failed operation via ${broker}.`,
            error: errorMessage,
        };
    } finally {
        if (producer && typeof producer.disconnect === 'function') {
            console.log(`Disconnecting broker ${broker}...`);
            await producer
                .disconnect()
                .catch(err => console.error(`🟡 Error during ${broker} disconnect:`, err));
            console.log(`Broker ${broker} disconnected.`);
        }
    }
}

export async function sendDeviceData(data: string, connectionSettings: ConnectionSettings): Promise<DataSentResult> {
    try {
        if (isHttpConnectionSettings(connectionSettings)) {
            return await sendDataViaRest(data, connectionSettings);
        } else if (isBrokerConnectionSettings(connectionSettings)) {
            return await sendDataToBroker(data, connectionSettings);
        } else {
            // should not happen if settings are validated beforehand
            console.error("Unsupported connection settings type:", connectionSettings);
            throw new Error(`Unsupported connection settings type`);
        }
    } catch (error) {
        // catch potential errors from isHttp/isBroker checks or unexpected issues
        console.error("🔴 Failed to send data (outer catch)", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            message: "Failed to send data due to unexpected error",
            error: errorMessage,
        };
    }
}
