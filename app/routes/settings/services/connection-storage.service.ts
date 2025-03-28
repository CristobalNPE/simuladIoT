import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
    type HttpConnectionSettings,
    HttpConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {settingsSessionStorage} from "~/routes/settings/sessions/settings-storage.server";


const defaultHttpSettings: HttpConnectionSettings = {
    connectionString: "http://localhost:8080/api/v1/sensor_data",
};

const defaultBrokerSettings: BrokerConnectionSettings = {
    broker: "activemq-http",
    destination: "iot/sensors",
    connectionString: "tcp://localhost:61616",

};

const BROKER_SETTINGS_KEY = "broker-settings";
const HTTP_SETTINGS_KEY = "http-settings";
export const connectionStorageService = {

    async getHttpConnectionSettingsFromRequest(request: Request): Promise<HttpConnectionSettings> {
        const session = await settingsSessionStorage.getSession(request.headers.get("Cookie"));
        let httpSettings: HttpConnectionSettings;

        try {
            httpSettings = HttpConnectionSettingsSchema.parse(session.get(HTTP_SETTINGS_KEY));
            console.log(`Http settings parsed from session:`, httpSettings);
        } catch (error) {
            console.error("Error parsing broker settings from session, using defaults:", error);
           return defaultHttpSettings;
        }
        return httpSettings;
    },

    async getBrokerConnectionSettingsFromRequest(request: Request): Promise<BrokerConnectionSettings> {
        const session = await settingsSessionStorage.getSession(request.headers.get("Cookie"));
        let brokerSettings: BrokerConnectionSettings;

        try {
            brokerSettings = BrokerConnectionSettingsSchema.parse(session.get(BROKER_SETTINGS_KEY));
            console.log(`Broker settings parsed from session:`, brokerSettings);
        } catch (error) {
            console.error("Error parsing broker settings from session, using defaults:", error);
            return defaultBrokerSettings;
        }
        return brokerSettings;
    },

    async getCurrentConnectionSettings(request: Request): Promise<{ broker: BrokerConnectionSettings, http: HttpConnectionSettings }> {
        return {
            broker: await this.getBrokerConnectionSettingsFromRequest(request),
            http: await this.getHttpConnectionSettingsFromRequest(request)
        }
    },

        //TODO: DELETE FROM SESSION
    // clearHttpSettings(): void {
    // },
    //
    // clearMqttSettings(): void {
    // }


}