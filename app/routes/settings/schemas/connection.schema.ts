import {z} from "zod";
import {BrokerTypeSchema} from "~/types/broker.types";

//ty gemini 🤖
const isValidBrokerUri = (uri: string): boolean => {
    try {
        // Basic check for common schemes and host/port structure
        const commonBrokerRegex = /^(tcp|ssl|mqtt|mqtts|amqp|amqps):\/\/([^:/]+)(:\d+)?$/;
        if (commonBrokerRegex.test(uri)) {
            // Further parsing could be done here if needed (e.g., validate port range)
            return true;
        }
        // Allow ActiveMQ Artemis specific format (if needed)
        // Example: (tcp://host:port,tcp://host2:port)?option=value
        const artemisRegex = /^\((tcp|ssl):\/\/[^,]+(,(tcp|ssl):\/\/[^,]+)*\)(\?.+)?$/;
        if (artemisRegex.test(uri)) {
            return true;
        }

        // Add checks for other specific formats if necessary

        // If it's an HTTP URL (for activemq-http) let the URL validator catch it later?
        // Or specifically allow http/https here too? Depends on your 'activemq-http' handling.
        // Let's allow http/https here for flexibility with activemq-http derived URLs
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return true; // Rely on URL validation if broker is activemq-http
        }

        return false; // Doesn't match known patterns
    } catch (e) {
        // Errors during regex or URL parsing
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

