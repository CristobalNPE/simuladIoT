import {z} from "zod";
import {BrokerTypeSchema} from "~/types/broker.types";

export const AuthConfigSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1)
});

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const HttpConnectionSettingsSchema = z.object({
    connectionString: z.string().min(1),
});

export const BrokerConnectionSettingsSchema = z.object({
    connectionString: z.string().min(1), //todo; add validations?
    broker: BrokerTypeSchema,
    destination: z.string().min(1),
    auth: AuthConfigSchema.optional()
});


export type HttpConnectionSettings = z.infer<typeof HttpConnectionSettingsSchema>
export type BrokerConnectionSettings = z.infer<typeof BrokerConnectionSettingsSchema>
export type ConnectionSettings = HttpConnectionSettings | BrokerConnectionSettings

export function isHttpConnectionSettings(settings: ConnectionSettings): settings is HttpConnectionSettings {
    return 'domain' in settings && 'endpoint' in settings;
}

export function isBrokerConnectionSettings(settings: ConnectionSettings): settings is BrokerConnectionSettings {
    return 'destination' in settings;
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