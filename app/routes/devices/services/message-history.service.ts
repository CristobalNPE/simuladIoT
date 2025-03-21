import { v4 as uuidv4 } from 'uuid';
import type { Message } from '~/routes/devices/schemas/message.schema';

const STORAGE_KEY = 'sensor_message_history';

interface MessageHistoryBySensor {
    [sensorId: string]: Message[];
}

export const messageHistoryService = {

    getAllMessageHistory(): MessageHistoryBySensor {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    getMessageHistoryBySensorId(sensorId: string): Message[] {
        const allHistory = this.getAllMessageHistory();
        return allHistory[sensorId] || [];
    },


    addMessage(sensorId: string, message: Omit<Message, 'id'>): Message {
        const messageWithId: Message = {
            ...message,
            id: uuidv4(),
        };

        const allHistory = this.getAllMessageHistory();

        if (!allHistory[sensorId]) {
            allHistory[sensorId] = [];
        }

        allHistory[sensorId] = [messageWithId, ...allHistory[sensorId]];

        if (allHistory[sensorId].length > 100) {
            allHistory[sensorId] = allHistory[sensorId].slice(0, 100);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
        return messageWithId;
    },

    createMessageRecord(
        sensorId: string,
        apiKey: string,
        jsonData: any[],
        responseStatus: number,
        responseMessage: string
    ): Message {
        const requestTime = new Date().toISOString();
        const responseTime = new Date().toISOString();

        const message: Omit<Message, 'id'> = {
            timestamp: requestTime,
            request: {
                api_key: apiKey,
                json_data: jsonData
            },
            response: {
                status: responseStatus,
                message: responseMessage,
                timestamp: responseTime
            }
        };

        return this.addMessage(sensorId, message);
    },


    clearHistoryForSensor(sensorId: string): void {
        const allHistory = this.getAllMessageHistory();
        delete allHistory[sensorId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    },

    clearAllHistory(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};