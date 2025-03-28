import type {Message} from "~/routes/devices/schemas/message.schema";
import type {Session} from "react-router";
import {commitSession, getSession} from "~/services/session.server";
import {v4 as uuidv4} from 'uuid';

const HISTORY_KEY = 'session_message_history';
const MAX_HISTORY_PER_SENSOR = 50;

interface MessageHistoryMap {
    [sensorId: string]: Message[];
}

interface HistoryRecordArgs {
    sensorId: string;
    apiKey: string;
    payloadSent: any; // The actual JS object/array payload before stringifying
    dataSentResult: { // Result from sendDeviceData (adapt if your type differs)
        success: boolean;
        message: string;
        error?: string;
        // Add status if available/relevant
        status?: number;
    };
}

export const messageHistoryService = {

    /**
     * Retrieves the message history map from the session. Internal use mostly.
     */
    _getHistoryMap: (session: Session): MessageHistoryMap => {
        return session.get(HISTORY_KEY) || {};
    },

    /**
     * Gets message history for a specific sensor from the session.
     * To be called in loaders.
     */
    async getHistoryForSensor(request: Request, sensorId: string): Promise<Message[]> {
        const session = await getSession(request.headers.get("Cookie"));
        const historyMap = this._getHistoryMap(session);
        return (historyMap[sensorId] || []).sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    },

    /**
     * Adds a new message record to the history for a sensor in the session.
     * To be called within server actions AFTER a send attempt.
     * Returns Headers necessary to commit the session.
     */
    async addMessageRecord(request: Request, args: HistoryRecordArgs): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const historyMap = this._getHistoryMap(session);
        const {sensorId, apiKey, payloadSent, dataSentResult} = args;

        const timestamp = new Date().toISOString();

        const jsonData = Array.isArray(payloadSent) ? payloadSent : [payloadSent];

        const newMessage: Message = {
            id: uuidv4(),
            timestamp: timestamp,
            request: {
                api_key: apiKey,
                json_data: jsonData
            },
            response: {
                status: dataSentResult.status || (dataSentResult.success ? 200 : 500),
                message: dataSentResult.error || dataSentResult.message,
                timestamp: timestamp
            }
        };

        if (!historyMap[sensorId]) {
            historyMap[sensorId] = [];
        }

        historyMap[sensorId].unshift(newMessage);

        if (historyMap[sensorId].length > MAX_HISTORY_PER_SENSOR) {
            historyMap[sensorId] = historyMap[sensorId].slice(0, MAX_HISTORY_PER_SENSOR);
        }

        session.set(HISTORY_KEY, historyMap);

        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        return {headers};
    },

    /**
     * Clears history for a specific sensor in the session.
     * To be called in server actions (e.g., when deleting a sensor).
     * Returns Headers necessary to commit the session.
     */
    async clearHistoryForSensor(request: Request, sensorId: string): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const historyMap = this._getHistoryMap(session);

        delete historyMap[sensorId]; // remove the key for the sensor

        session.set(HISTORY_KEY, historyMap);

        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        return {headers};
    }


}