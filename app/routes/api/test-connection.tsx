import {data} from "react-router";
import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
    type HttpConnectionSettings,
    HttpConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {createProducer} from "~/services/producer.factory";

type TestResult = { success: boolean, message: string };


export async function action({request}: Route.ActionArgs) {
    const formData = await request.formData();

    const connectionType = formData.get("connectionType");
    const connectionString = formData.get("connectionString") as string | null;
    const destination = formData.get("destination") as string | null;
    const broker = formData.get("broker") as string | null;
    const username = formData.get("auth.username") as string | null;
    const password = formData.get("auth.password") as string | null;

    let result: TestResult;

    try {
        // Validate mandatory fields common to both or needed for type check
        if (!connectionType || typeof connectionType !== 'string') {
            throw new Error("connectionType not specified in form data.");
        }
        if (!connectionString) {
            throw new Error("connectionString not provided in form data.");
        }

        if (connectionType === 'http') {
            const httpSettingsData = {connectionString};

            const httpSettingsParse = HttpConnectionSettingsSchema.safeParse(httpSettingsData);
            if (!httpSettingsParse.success) {
                throw new Error(`Invalid HTTP settings from form: ${httpSettingsParse.error.message}`);
            }
            result = await testHttpConnection(httpSettingsParse.data);

        } else if (connectionType === 'broker') {
            const auth = (username || password) ? {
                username: username ?? undefined,
                password: password ?? undefined
            } : undefined;
            const brokerSettingsData = {
                connectionString,
                destination: destination ?? undefined,
                broker: broker ?? undefined,
                auth: auth
            };

            const brokerSettingsParse = BrokerConnectionSettingsSchema.safeParse(brokerSettingsData);
            if (!brokerSettingsParse.success) {
                console.error("Broker settings validation failed for data:", brokerSettingsData);
                throw new Error(`Invalid Broker settings from form: ${brokerSettingsParse.error.message}`);
            }
            result = await testBrokerConnection(brokerSettingsParse.data);

        } else {
            throw new Error(`Invalid connectionType specified: ${connectionType}`);
        }

        return data<TestResult>(result);

    } catch (error) {
        console.error("[Test Connection Action] Error:", error);
        const message = error instanceof Error ? error.message : "Unknown error during connection test.";
        return data<TestResult>({success: false, message}, {status: 500});
    }

}


async function testHttpConnection(settings: HttpConnectionSettings): Promise<TestResult> {
    console.log(`[Test Connection] Testing HTTP to: ${settings.connectionString}`);
    try {
        const response = await fetch(settings.connectionString, {method: "HEAD", signal: AbortSignal.timeout(5000)});
        console.log(`[Test Connection] HTTP Status: ${response.status}`);

        //  statuses considered ok:
        if (response.ok || response.status === 401 || response.status === 403 || response.status === 404) {
            return {success: true, message: `El servidor parece activo y responde (Status ${response.status}).`};
        } else {
            return {
                success: false,
                message: `El servidor se pudo conectar pero devolvió un error (Status ${response.status}).`
            };
        }
    } catch (error: any) {
        console.error("[Test Connection] HTTP fetch failed:", error);
        if (error.name === 'TimeoutError') {
            return {success: false, message: "Conexión con el servidor expiró."};
        }
        return {success: false, message: `Falló la conexión con el servidor: ${error.message}`};
    }
}

async function testBrokerConnection(settings: BrokerConnectionSettings): Promise<TestResult> {
    console.log(`[Test Connection] Testing Broker (${settings.broker}) to: ${settings.connectionString}`);
    const config = { // ProducerConfig
        connectionString: settings.connectionString,
        username: settings.auth?.username,
        password: settings.auth?.password,
    };
    let producer = null;
    try {
        producer = createProducer(settings.broker, config);
        await producer.connect(); // Attempt connection
        console.log(`[Test Connection] Broker (${settings.broker}) connected successfully.`);
        return {success: true, message: "Conexión con Broker establecida correctamente."};
    } catch (error: any) {
        console.error(`[Test Connection] Broker (${settings.broker}) connection failed:`, error);
        return {success: false, message: `Falló la conexión con el Broker: ${error.message}`};
    } finally {
        if (producer && typeof producer.disconnect === 'function') {
            await producer.disconnect().catch(err => console.error("Error during test disconnect:", err));
        }
    }
}