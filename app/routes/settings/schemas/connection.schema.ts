import {z} from "zod";


export const HttpConnectionSettingsSchema = z.object({
    domain: z.string(),
    port: z.coerce.number().optional(),
    endpoint: z.string(),
    isLocal: z.coerce.boolean()
});

export const MqttConnectionSettingsSchema = z.object({
    broker: z.string(),
    port: z.coerce.number(),
    topic: z.string(),
    isLocal: z.coerce.boolean()
});


export type HttpConnectionSettings = z.infer<typeof HttpConnectionSettingsSchema>
export type MqttConnectionSettings = z.infer<typeof MqttConnectionSettingsSchema>
export type ConnectionSettings = HttpConnectionSettings | MqttConnectionSettings

export function isHttpConnectionSettings(settings: ConnectionSettings): settings is HttpConnectionSettings {
    return 'domain' in settings && 'endpoint' in settings;
}

export function isMqttConnectionSettings(settings: ConnectionSettings): settings is MqttConnectionSettings {
    return 'broker' in settings && 'topic' in settings;
}

export function validateConnectionSettings(settings: unknown): ConnectionSettings {
    try {
        return HttpConnectionSettingsSchema.parse(settings);
    } catch (e) {
        try {
            return MqttConnectionSettingsSchema.parse(settings);
        } catch (e2) {
            throw new Error("Invalid connection settings");
        }
    }
}