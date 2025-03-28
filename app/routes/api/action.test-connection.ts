import {data} from "react-router";
import {
    type BrokerConnectionSettings,
    BrokerConnectionSettingsSchema,
    type HttpConnectionSettings,
    HttpConnectionSettingsSchema
} from "~/routes/settings/schemas/connection.schema";
import {createProducer} from "~/services/producer.factory";
import type {TestConnectionResult} from "~/routes/api/types/connection-test.types";
import type { Route } from "./+types/test-connection";


export async function action({request}: Route.ActionArgs) {
    const formData = await request.formData();

    const connectionType = formData.get("connectionType");
    const connectionString = formData.get("connectionString") as string | null;
    const destination = formData.get("destination") as string | null;
    const broker = formData.get("broker") as string | null;
    const username = formData.get("auth.username") as string | null;
    const password = formData.get("auth.password") as string | null;

    let result: TestConnectionResult;

    try {
        if (!connectionType || typeof connectionType !== 'string') {
            throw new Error("connectionType not specified in form data.");
        }
        if (!connectionString) {
            throw new Error("String de Conexión no definida o no válida.");
        }

        if (connectionType === 'http') {
            const httpSettingsData = {connectionString};

            const httpSettingsParse = HttpConnectionSettingsSchema.safeParse(httpSettingsData);
            if (!httpSettingsParse.success) {
                return data<TestConnectionResult>({
                    status: 'error',
                    message: `Configuración HTTP inválida: ${httpSettingsParse.error.flatten().formErrors.join(', ')}`
                }, {status: 400});
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

                return data<TestConnectionResult>({
                    status: 'error',
                    message: `Configuración de Broker inválida: ${brokerSettingsParse.error.flatten().formErrors.join(', ')}`
                }, {status: 400});
            }
            result = await testBrokerConnection(brokerSettingsParse.data);

        } else {
            return data<TestConnectionResult>({
                status: 'error',
                message: `Tipo de conexión inválido: ${connectionType}`
            }, {status: 400});
        }

        return data<TestConnectionResult>(result);

    } catch (error) {
        console.error("[Test Connection Action] Error:", error);
        const message = error instanceof Error ? error.message : "Error desconocido durante la prueba de conexión.";
        return data<TestConnectionResult>({status: 'error', message}, {status: 500});
    }

}


async function testHttpConnection(settings: HttpConnectionSettings): Promise<TestConnectionResult> {
    console.log(`[Test Connection] Testing HTTP to: ${settings.connectionString}`);
    try {
        const response = await fetch(settings.connectionString, {method: "HEAD", signal: AbortSignal.timeout(5000)});
        console.log(`[Test Connection] HTTP Status: ${response.status}`);

        //  statuses considered ok:
        if (response.ok || response.status === 401 || response.status === 403 || response.status === 404) {
            return {status: 'success', message: `Servidor encontrado y responde (Status ${response.status}).`};
        } else if (response.status >= 400) {
            return {
                status: 'warning',
                message: `Servidor encontrado pero devolvió un error (Status ${response.status}).`
            };
        } else {
            return {status: 'warning', message: `Respuesta inesperada del servidor (Status ${response.status}).`};
        }
    } catch (error: any) {
        console.error("[Test Connection] HTTP fetch failed:", error);
        if (error.name === 'TimeoutError' || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
            return {status: 'error', message: "La conexión con el servidor expiró."};
        }
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return {
                status: 'error',
                message: `No se pudo conectar con el servidor (Host no encontrado o conexión rechazada).`
            };
        }
        return {status: 'error', message: `Falló la conexión: ${error.message}`};
    }
}

async function testBrokerConnection(settings: BrokerConnectionSettings): Promise<TestConnectionResult> {
    console.log(`[Test Connection] Testing Broker (${settings.broker}) to: ${settings.connectionString}`);
    const config = { // ProducerConfig
        connectionString: settings.connectionString,
        username: settings.auth?.username,
        password: settings.auth?.password,
    };
    let producer = null;
    try {
        producer = createProducer(settings.broker, config);
        await producer.connect();
        console.log(`[Test Connection] Broker (${settings.broker}) connected successfully.`);
        return {status: 'success', message: "Conexión con Broker establecida!"};
    } catch (error: any) {
        let specificMessage = error.message;
        if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
            specificMessage = "Autenticación fallida.";
        } else if (error.message?.includes('timed out')) {
            specificMessage = "Timeout durante la conexión.";
        }
        return {status: 'error', message: `Falló la conexión con el Broker: ${specificMessage}`};
    } finally {
        if (producer && typeof producer.disconnect === 'function') {
            await producer.disconnect().catch(err => console.error("Error during test disconnect:", err));
        }
    }
}