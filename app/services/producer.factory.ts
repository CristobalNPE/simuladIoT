import type {MessageProducer, ProducerConfig} from "~/services/producer.interface";
import {deriveActiveMqHttpUrl} from "~/utils/producer-utils";
import {ActiveMQHttpProducer} from "~/services/activemq-http.producer";


export function createProducer(brokerType: string, config: ProducerConfig): MessageProducer {

    console.log(`🏭 Creating producer for type: ${brokerType}`);

    switch (brokerType) {

        case "kafka": {
            if (!config.connectionString) throw new Error("Kafka connection string required.");
            throw new Error("Kafka direct implementation not handled by factory. Refactor to KafkaProducer class.");

        }

        case "rabbitmq": {
            if (!config.connectionString) throw new Error("RabbitMQ connection string required.");
            throw new Error("RabbitMQ direct implementation not handled by factory. Refactor to RabbitMQProducer class.");

        }

        case "activemq-http": {
            if (!config.connectionString) throw new Error("ActiveMQ HTTP producer requires 'connectionString' in config.");
            const activeMqHttpUrl = deriveActiveMqHttpUrl(config.connectionString);

            const activeMqHttpConfig: ProducerConfig = {
                ...config,
                connectionString: activeMqHttpUrl
            }
            return new ActiveMQHttpProducer(activeMqHttpConfig);
        }

        default:
            throw new Error(`Unsupported broker type in factory: ${brokerType}`);

    }
}