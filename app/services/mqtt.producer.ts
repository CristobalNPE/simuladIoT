import type {MessageProducer, ProducerConfig} from "~/services/producer.interface";
import mqtt, {type IClientOptions, type MqttClient} from "mqtt";

export class MqttProducer implements MessageProducer {

    private config: ProducerConfig;
    private client: MqttClient | null = null;
    private isConnectedState: boolean = false;
    private connectionPromise: Promise<void> | null = null;

    constructor(config: ProducerConfig) {
        if (!config.connectionString) {
            throw new Error("MqttProducer requires 'connectionString' (mqtt[s]://host:port) in config.");
        }
        this.config = config;
        console.log("⚪ MqttProducer: Configured with URL:", this.config.connectionString);
    }


    async connect(): Promise<void> {
        if (this.connectionPromise) {
            console.log("⚪ MqttProducer: Connection attempt already in progress.");
            return this.connectionPromise;
        }
        if (this.isConnectedState) {
            console.log("🔵 MqttProducer: Already connected.");
            return Promise.resolve();
        }


        console.log(`⚪ MqttProducer: Attempting to connect to ${this.config.connectionString}...`);

        const options: IClientOptions = {
            clientId: this.config.clientId || `simuladIoT-mqtt-${Date.now()}`,
            username: this.config.username,
            password: this.config.password,
            connectTimeout: this.config.timeout || 10000,//10s
        };

        this.connectionPromise = new Promise<void>((resolve, reject) => {

            if (this.client) {
                this.client.end();
            }

            this.client = mqtt.connect(this.config.connectionString, options);

            const connectTimeout = setTimeout(() => {
                this.client?.end(true);
                reject(new Error(`Connection timed out after ${options.connectTimeout}ms`));
            }, options.connectTimeout);

            this.client.on('connect', () => {
                clearTimeout(connectTimeout);
                this.isConnectedState = true;
                console.log(`🟢 MqttProducer: Connected successfully to ${this.config.connectionString}.`);
                resolve();
            });

            this.client.on('error', (err) => {
                clearTimeout(connectTimeout);
                console.error('🔴 MqttProducer: Connection error:', err);
                this.isConnectedState = false;
                this.client?.end(true); // Ensure client is closed on error
                reject(new Error(`MQTT connection failed: ${err.message}`));
            });

            this.client.on('close', () => {
                //  fires after disconnect() or on unexpected close
                console.log('⚪ MqttProducer: Connection closed.');
                this.isConnectedState = false;
            });

        }).finally(() => {
            this.connectionPromise = null;

        });
        return this.connectionPromise;
    }

    async disconnect(): Promise<void> {
        if (this.connectionPromise) {
            console.warn("⚪ MqttProducer: Waiting for pending connection attempt before disconnecting.");
            try {
                await this.connectionPromise;
            } catch {
                // ignore connection error if we are trying to disconnect anyway
            }
        }

        if (this.client && this.isConnectedState) {
            console.log("👋 MqttProducer: Disconnecting...");
            return new Promise((resolve) => {
                this.client?.once('close', () => {
                    console.log("👋 MqttProducer: Disconnected successfully.");
                    this.isConnectedState = false;
                    this.client = null;
                    resolve();
                });
                this.client?.end(false, {}, () => {
                });
                setTimeout(() => {
                    if (this.isConnectedState) {
                        console.warn("🟡 MqttProducer: Disconnect timeout, forcing state update.");
                        this.isConnectedState = false;
                        this.client = null;
                        resolve();
                    }
                }, 2000);
            });
        } else {
            console.log("⚪ MqttProducer: Already disconnected or never connected.");
            this.isConnectedState = false;
            this.client = null;
            return Promise.resolve();
        }
    }

    async sendMessage(destination: string, message: any): Promise<void> {
        if (!this.isConnectedState || !this.client) {
            throw new Error("MqttProducer not connected. Call connect() first.");
        }

        const payload = (typeof message === 'string' || Buffer.isBuffer(message))
            ? message
            : Buffer.from(JSON.stringify(message));

        console.log(`📤 MqttProducer: Publishing message to topic '${destination}'...`);

        return new Promise((resolve, reject) => {
            this.client?.publish(destination, payload, {qos: 1}, (err) => {
                if (err) {
                    console.error(`🔴 MqttProducer: Error publishing to ${destination}:`, err);
                    reject(err);
                } else {
                    console.log(`✅ MqttProducer: Message published successfully to ${destination}.`);
                    resolve();
                }
            });
        });
    }

    isConnected(): boolean {
        return this.isConnectedState && !!this.client && this.client.connected;
    }
}