import {z} from "zod";

const BaseConnectionSchema = z.object({
    port: z.number(),
})

const RestConnectionSchema = BaseConnectionSchema.extend({
    connectionType: z.literal("rest"),
    domain: z.string(),
    endpoint: z.string(),
})

const MqttConnectionSchema = BaseConnectionSchema.extend({
    connectionType: z.literal("mqtt"),
    broker: z.string(),
    topic: z.string(),
})

const ConnectionConfigSchema = z.discriminatedUnion("connectionType", [
    RestConnectionSchema,
    MqttConnectionSchema
]);

export {
    MqttConnectionSchema,
    RestConnectionSchema,
    ConnectionConfigSchema
}

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;
export type RestConnection = z.infer<typeof RestConnectionSchema>;
export type MqttConnection = z.infer<typeof MqttConnectionSchema>;