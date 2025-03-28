import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
    type HttpConnectionSettings,
    HttpConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {commitSession, getSession} from "~/services/session.server";


const defaultHttpSettings: HttpConnectionSettings = {
    connectionString: "http://localhost:8080/api/v1/sensor_data",
};

const defaultBrokerSettings: BrokerConnectionSettings = {
    broker: "activemq-http",
    destination: "iot/sensors",
    connectionString: "tcp://localhost:61616",
    auth: {
        username: "admin",
        password: ""
    }
};

type SettingsResult<T> = {
    settings: T,
    isDefault: boolean
}

const BROKER_SETTINGS_KEY = "broker-settings";
const HTTP_SETTINGS_KEY = "http-settings";
export const connectionStorageServer = {

    async getHttpConnectionSettingsFromRequest(request: Request): Promise<SettingsResult<HttpConnectionSettings>> {
        const session = await getSession(request.headers.get("Cookie"));
        const settingsData = session.get(HTTP_SETTINGS_KEY);

        const parseResult = HttpConnectionSettingsSchema.safeParse(settingsData);
        if (parseResult.success) {
            return {settings: parseResult.data, isDefault: false};
        } else {
            return {settings: defaultHttpSettings, isDefault: true};
        }
    },

    async storeHttpConnectionSettings(request: Request, settings: HttpConnectionSettings): Promise<{
        headers: Headers
    }> {
        const session = await getSession(request.headers.get("Cookie"));

        const validatedSettings = HttpConnectionSettingsSchema.parse(settings);
        session.set(HTTP_SETTINGS_KEY, validatedSettings);
        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        console.log(`Stored HTTP settings in session.`);
        return {headers};
    },

    async getBrokerConnectionSettingsFromRequest(request: Request): Promise<SettingsResult<BrokerConnectionSettings>> {
        const session = await getSession(request.headers.get("Cookie"));
        const settingsData = session.get(BROKER_SETTINGS_KEY);

        const parseResult = BrokerConnectionSettingsSchema.safeParse(settingsData);
        if (parseResult.success) {
            return {settings: parseResult.data, isDefault: false};
        } else {
            return {settings: defaultBrokerSettings, isDefault: true};
        }
    },

    async storeBrokerConnectionSettings(request: Request, settings: BrokerConnectionSettings): Promise<{
        headers: Headers
    }> {
        const session = await getSession(request.headers.get("Cookie"));

        const validatedSettings = BrokerConnectionSettingsSchema.parse(settings);
        session.set(BROKER_SETTINGS_KEY, validatedSettings);
        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        console.log(`Stored Broker settings in session.`);
        return {headers};
    },

    /**
     * Checks if both HTTP and Broker connection settings exist and are valid
     * according to their schemas in the current session.
     * @param request The incoming Request object.
     * @returns Promise<boolean> True if both settings exist and are valid, false otherwise.
     */
    async checkConnectionsExist(request: Request): Promise<boolean> {
        const session = await getSession(request.headers.get("Cookie"));
        const httpData = session.get(HTTP_SETTINGS_KEY);
        const brokerData = session.get(BROKER_SETTINGS_KEY);

        const httpParseResult = HttpConnectionSettingsSchema.safeParse(httpData);
        const brokerParseResult = BrokerConnectionSettingsSchema.safeParse(brokerData);

        if (!httpParseResult.success) {
            console.log(`[CheckConnections] HTTP settings not found or invalid.`);
        }
        if (!brokerParseResult.success) {
            console.log(`[CheckConnections] Broker settings not found or invalid.`);
        }

        return httpParseResult.success && brokerParseResult.success;
    },


    async clearHttpSettings(request: Request): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        session.unset(HTTP_SETTINGS_KEY);
        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        return {headers};
    },
    async clearBrokerSettings(request: Request): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        session.unset(BROKER_SETTINGS_KEY);
        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        return {headers};
    }

}