import mqtt from 'mqtt';

interface MqttMessageParams {
    broker: string;
    port: number;
    topic: string;
    payload: string;
}

class MqttService {
    private client: mqtt.MqttClient | null = null;
    private connected = false;
    private subscriptions: Map<string, (topic: string, message: Buffer) => void> = new Map();

    connect(broker: string, port: number): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.connected) {
                resolve();
                return;
            }

            const url = `mqtt://${broker}:${port}`;
            this.client = mqtt.connect(url);

            this.client.on('connect', () => {
                this.connected = true;
                console.log(`Connected to MQTT broker at ${url}`);
                resolve();
            });

            this.client.on('error', (err) => {
                console.error('MQTT connection error:', err);
                reject(err);
            });

            this.client.on('message', (topic, message) => {
                const handler = this.subscriptions.get(topic);
                if (handler) {
                    handler(topic, message);
                }
            });

            this.client.on('close', () => {
                this.connected = false;
                console.log('Disconnected from MQTT broker');
            });
        });
    }

    async sendMessage({broker, port, topic, payload}: MqttMessageParams): Promise<void> {
        await this.connect(broker, port);

        return new Promise((resolve, reject) => {
            if (!this.client || !this.connected) {
                reject(new Error('MQTT client not connected'));
                return;
            }

            this.client.publish(topic, payload, {qos: 1}, (err) => {
                if (err) {
                    console.error(`Error publishing to ${topic}:`, err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

}

const mqttService = new MqttService();
export default mqttService;

//function for direct usage
export async function sendMqttMessage(params: MqttMessageParams): Promise<void> {
    return mqttService.sendMessage(params);
}
