import {z} from "zod";

export const BROKER_TYPES = {
    // KAFKA: 'kafka',
    RABBITMQ: 'rabbitmq',
    ACTIVEMQ_HTTP: 'activemq-http',
    MQTT: 'mqtt'
} as const;

export const BrokerTypeSchema = z.enum([
    // BROKER_TYPES.KAFKA,
    BROKER_TYPES.RABBITMQ,
    BROKER_TYPES.ACTIVEMQ_HTTP,
    BROKER_TYPES.MQTT
]);

export type BrokerType = z.infer<typeof BrokerTypeSchema>;

export const BrokerMetadataSchema = z.object({
    label: z.string(),
    requiresAuth: z.boolean().default(false)
});

export type BrokerTypeMetadata = z.infer<typeof BrokerMetadataSchema>;

export const brokerTypeMetadataSchema = z.record(BrokerTypeSchema, BrokerMetadataSchema);

export const brokerTypeMetadata: Record<BrokerType, BrokerTypeMetadata> = {
    // [BROKER_TYPES.KAFKA]: {
    //     label: 'Apache Kafka',
    //     requiresAuth: false
    // },
    [BROKER_TYPES.RABBITMQ]: {
        label: 'RabbitMQ',
        requiresAuth: false
    },
    [BROKER_TYPES.ACTIVEMQ_HTTP]: {
        label: 'ActiveMQ (HTTP)',
        requiresAuth: true
    },
    [BROKER_TYPES.MQTT]: {
        label: 'MQTT',
        requiresAuth: false
    }
};
brokerTypeMetadataSchema.parse(brokerTypeMetadata);

export function getAllBrokerTypes(): BrokerType[] {
    return Object.values(BROKER_TYPES);
}

export function brokerRequiresAuth(brokerType: BrokerType): boolean {
    return brokerTypeMetadata[brokerType]?.requiresAuth ?? false;
}

