import {z} from "zod";
import {BrokerTypeSchema} from "~/types/broker.types";

//ty gemini 🤖
const isValidBrokerUri = (uri: string): boolean => {

    console.log(`Received broker URI: ${uri}`);
    try {
        // Allows for optional user:pass@ before the host
        const commonBrokerRegex = /^(tcp|ssl|mqtt|mqtts|amqp|amqps):\/\/(?:[^:@/]+(?::[^@/]+)?@)?([^:/]+)(:\d+)?$/;
        // Explanation:
        // ^(tcp|...|amqps):  // Scheme
        // \/\/                // Separator
        // (?:                 // Start optional user:pass group (non-capturing)
        //   [^:@/]+           // Username (no ':', '@', '/')
        //   (?::[^@/]+)?      // Optional ':password' (no '@', '/')
        // @)?                 // End optional user:pass group, followed by '@'
        // ([^:/]+)            // Hostname (capture group 2 - no ':' or '/')
        // (:\d+)?             // Optional ':port' (capture group 3)
        // $                   // End of string

        if (commonBrokerRegex.test(uri)) {
            console.log(`Common broker regex matched: ${uri}`);
            return true;
        }
        const artemisRegex = /^\((tcp|ssl):\/\/[^,]+(,(tcp|ssl):\/\/[^,]+)*\)(\?.+)?$/;
        if (artemisRegex.test(uri)) {
            console.log(`Artemis broker regex matched: ${uri}`);
            return true;
        }
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            console.log(`ActiveMQ HTTP broker regex matched: ${uri}`);
            return true;
        }
        console.log(`Unknown broker regex matched: ${uri}`);
        return false;
    } catch (e) {
        console.log(`Error during broker URI check: ${e}`);

        return false;
    }
};


export const AuthConfigSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const HttpConnectionSettingsSchema = z.object({
    connectionString: z.string()
        .min(1, {message: "La URL de conexión HTTP no puede estar vacía."})
        .url({message: "Debe ser una URL HTTP/HTTPS válida (ej., http://example.com)."})
});

export const BrokerConnectionSettingsSchema = z.object({
    connectionString: z.string()
        .min(1, {message: "El string de conexión del Broker no puede estar vacío."})
        .refine(isValidBrokerUri, {
            message: "Formato de URI de conexión inválido (ej., tcp://host:port, mqtt://host:port)."
        }),
    broker: BrokerTypeSchema,
    destination: z.string().min(1, {message: "El Destino (topic/queue) no puede estar vacío."}),
    auth: AuthConfigSchema.optional()
});


export type HttpConnectionSettings = z.infer<typeof HttpConnectionSettingsSchema>
export type BrokerConnectionSettings = z.infer<typeof BrokerConnectionSettingsSchema>
export type ConnectionSettings = HttpConnectionSettings | BrokerConnectionSettings

export function isHttpConnectionSettings(settings: ConnectionSettings): settings is HttpConnectionSettings {
    return (
        settings != null &&
        typeof settings === 'object' &&
        !('broker' in settings));
}

export function isBrokerConnectionSettings(settings: ConnectionSettings): settings is BrokerConnectionSettings {
    return (settings != null &&
        typeof settings === 'object' &&
        'destination' in settings)
}

export function validateConnectionSettings(settings: unknown): ConnectionSettings {
    try {
        return HttpConnectionSettingsSchema.parse(settings);
    } catch (e) {
        try {
            return BrokerConnectionSettingsSchema.parse(settings);
        } catch (e2) {
            throw new Error("Invalid connection settings");
        }
    }
}

