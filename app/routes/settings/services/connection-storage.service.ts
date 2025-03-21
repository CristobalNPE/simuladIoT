import {
    type HttpConnectionSettings,
    HttpConnectionSettingsSchema,
    type MqttConnectionSettings,
    MqttConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";

const HTTP_SETTINGS_KEY = 'http_settings';
const MQTT_SETTINGS_KEY = 'mqtt_settings';

const defaultHttpSettings: HttpConnectionSettings = {
    domain: 'localhost',
    port: 8080,
    endpoint: '/api/v1/sensor_data',
    isLocal: true
};

const defaultMqttSettings: MqttConnectionSettings = {
    broker: 'localhost',
    port: 9001,
    topic: 'iot/sensors',
    isLocal: true
};

export const connectionStorageService = {

    getHttpSettings(): HttpConnectionSettings {
        const httpSettings = localStorage.getItem(HTTP_SETTINGS_KEY);

        if (!httpSettings) {
            this.saveHttpSettings(defaultHttpSettings);
            return defaultHttpSettings;
        }
        try {
            const parsedSettings = JSON.parse(httpSettings);
            if (parsedSettings) {
                return HttpConnectionSettingsSchema.parse(parsedSettings);
            }
            return defaultHttpSettings;
        } catch (error) {
            console.error('Error parsing HTTP settings from local storage:', error);
            return defaultHttpSettings;
        }
    },

    saveHttpSettings(settings: HttpConnectionSettings): void {
        const settingsString = JSON.stringify(settings);
        localStorage.setItem(HTTP_SETTINGS_KEY, settingsString);
    },

    getMqttSettings(): MqttConnectionSettings {
        const mqttSettings = localStorage.getItem(MQTT_SETTINGS_KEY);

        if (!mqttSettings) {
            this.saveMqttSettings(defaultMqttSettings);
            return defaultMqttSettings;
        }
        try {
            const parsedSettings = JSON.parse(mqttSettings);
            if (parsedSettings) {
                return MqttConnectionSettingsSchema.parse(parsedSettings);
            }
            return defaultMqttSettings;
        } catch (error) {
            console.error('Error parsing MQTT settings from local storage:', error);
            return defaultMqttSettings;
        }
    },

    getCurrentConnectionStrings() {
        return {
            mqtt: this.getMqttConnectionString(),
            http: this.getHttpConnectionString()
        }
    },

    getHttpConnectionString() {
        const httpSettings = this.getHttpSettings();

        const isLocalDomain = httpSettings.domain === 'localhost' || httpSettings.domain === '127.0.0.1';
        const protocol = isLocalDomain ? "http" : "https";
        const sanitizedEndpoint = httpSettings.endpoint.startsWith("/") ? httpSettings.endpoint : `/${httpSettings.endpoint}`
        return `${protocol}://${httpSettings.domain}${isLocalDomain ? `:${httpSettings.port}` : ''}${sanitizedEndpoint}`;
    },

    getMqttConnectionString() {
        const mqttSettings = this.getMqttSettings();
        const isLocalDomain = mqttSettings.broker === 'localhost' || mqttSettings.broker === '127.0.0.1';
        const protocol = "ws"; // or tcp?
        const sanitizedTopic = mqttSettings.topic.startsWith("/") ? mqttSettings.topic : `/${mqttSettings.topic}`
        return `${protocol}://${mqttSettings.broker}${isLocalDomain ? `:${mqttSettings.port}` : ''}${sanitizedTopic}`;
    },


    saveMqttSettings(settings: MqttConnectionSettings): void {
        const settingsString = JSON.stringify(settings);
        localStorage.setItem(MQTT_SETTINGS_KEY, settingsString);
    },

    clearHttpSettings(): void {
        localStorage.removeItem(HTTP_SETTINGS_KEY);
    },

    clearMqttSettings(): void {
        localStorage.removeItem(MQTT_SETTINGS_KEY);
    }


}