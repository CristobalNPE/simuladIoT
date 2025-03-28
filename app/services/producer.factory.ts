import type {MessageProducer, ProducerConfig} from "~/services/producer.interface";
import {deriveActiveMqHttpUrl} from "~/utils/producer-utils";
import {ActiveMQHttpProducer} from "~/services/activemq-http.producer";
import {BROKER_TYPES, type BrokerType} from "~/types/broker.types";
import {MqttProducer} from "~/services/mqtt.producer";
import {RabbitMQProducer} from "~/services/rabbitmq.producer";


export function createProducer(brokerType: BrokerType, config: ProducerConfig): MessageProducer {

    console.log(`🏭 Creating producer for type: ${brokerType}`);

    switch (brokerType) {
        case BROKER_TYPES.MQTT: {
            if (!config.connectionString) throw new Error("MQTT connection string required (mqtt[s]://host:port).");
            // todo: here: add specific defaults for MQTT if needed
            return new MqttProducer(config);
        }

        case BROKER_TYPES.KAFKA: {
            if (!config.connectionString) throw new Error("Kafka connection string required.");
            throw new Error("Kafka direct implementation not handled by factory. Refactor to KafkaProducer class.");

        }

        case BROKER_TYPES.RABBITMQ: {
            if (!config.connectionString) throw new Error("RabbitMQ connection string required (amqp[s]://...).");
            // todo: here: add specific defaults for rabbitmq if needed
            return new RabbitMQProducer(config);

        }

        case BROKER_TYPES.ACTIVEMQ_HTTP: {
            if (!config.connectionString) throw new Error("ActiveMQ HTTP producer requires 'connectionString' in config.");
            const activeMqHttpUrl = deriveActiveMqHttpUrl(config.connectionString);

            const activeMqHttpConfig: ProducerConfig = {
                ...config,
                connectionString: activeMqHttpUrl
            }
            return new ActiveMQHttpProducer(activeMqHttpConfig);
        }

        default:
            const exhaustiveCheck: never = brokerType;
            throw new Error(`Unsupported broker type in factory: ${exhaustiveCheck}`);
    }
}