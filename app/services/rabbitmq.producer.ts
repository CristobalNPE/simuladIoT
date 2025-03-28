import type {MessageProducer, ProducerConfig} from "./producer.interface";
import {type Channel, type ChannelModel, connect} from 'amqplib';

export class RabbitMQProducer implements MessageProducer {
    private config: ProducerConfig;
    private connection: ChannelModel | null = null;
    private channel: Channel | null = null;
    private isConnectedState: boolean = false;


    constructor(config: ProducerConfig) {
        if (!config.connectionString) {
            throw new Error("RabbitMQProducer requires 'connectionString' (amqp[s]://...) in config.");
        }
        // destination can be exchange name or queue name
        this.config = config;
        console.log("⚪ RabbitMQProducer: Configured with URL:", this.config.connectionString);
    }

    async connect(): Promise<void> {
        if (this.isConnectedState) {
            console.log("🔵 RabbitMQProducer: Already connected.");
            return;
        }
        console.log(`⚪ RabbitMQProducer: Attempting to connect to ${this.config.connectionString}...`);
        try {
            this.connection = await connect(this.config.connectionString);
            this.connection.on('error', (err: any) => {
                console.error('🔴 RabbitMQProducer: Connection error:', err.message);
                this.isConnectedState = false;
                this.channel = null;
                this.connection = null;
            });
            this.connection.on('close', () => {
                console.log('⚪ RabbitMQProducer: Connection closed.');
                this.isConnectedState = false;
                this.channel = null;
                this.connection = null;
            });

            console.log(`🟢 RabbitMQProducer: Connection established.`);
            this.channel = await this.connection.createChannel();
            console.log(`🟢 RabbitMQProducer: Channel created.`);

            this.channel.on('error', (err: any) => {
                console.error('🔴 RabbitMQProducer: Channel error:', err.message);
                this.isConnectedState = false;
                this.channel = null;

            });
            this.channel.on('close', () => {
                console.log('⚪ RabbitMQProducer: Channel closed.');
                if (this.channel) this.channel = null;
            });


            this.isConnectedState = true;
            console.log(`🟢 RabbitMQProducer: Ready (Connection + Channel).`);

        } catch (error: any) {
            console.error('🔴 RabbitMQProducer: Failed to connect or create channel:', error);

            if (this.channel) {
                try {
                    await this.channel.close();
                } catch { /* do nothing? */
                }
                this.channel = null;
            }
            if (this.connection) {
                try {
                    await this.connection.close();
                } catch { /* do nothing? */
                }
                this.connection = null;
            }
            this.isConnectedState = false;
            throw new Error(`RabbitMQ connection/channel setup failed: ${error.message}`);
        }
    }

    async disconnect(): Promise<void> {
        this.isConnectedState = false;
        let hadError = false;

        if (this.channel) {
            console.log("⚪ RabbitMQProducer: Closing channel...");
            try {
                await this.channel.close();
                console.log("👋 RabbitMQProducer: Channel closed.");
            } catch (error: any) {
                console.error("🔴 RabbitMQProducer: Error closing channel:", error);
                hadError = true;
            } finally {
                this.channel = null;
            }
        }

        if (this.connection) {
            console.log("⚪ RabbitMQProducer: Closing connection...");
            try {
                await this.connection.close();
                console.log("👋 RabbitMQProducer: Connection closed.");
            } catch (error: any) {
                console.error("🔴 RabbitMQProducer: Error closing connection:", error);
                hadError = true;
            } finally {
                this.connection = null;
            }
        }

        if (!hadError) {
            console.log("👋 RabbitMQProducer: Disconnected successfully.");
        }

        return Promise.resolve();
    }

    async sendMessage(destination: string, message: any): Promise<void> {
        if (!this.isConnectedState || !this.channel) {
            throw new Error("RabbitMQProducer not connected or channel not available. Call connect() first.");
        }

        const payload = Buffer.isBuffer(message)
            ? message
            : Buffer.from(typeof message === 'string' ? message : JSON.stringify(message));

        console.log(`📤 RabbitMQProducer: Sending message to queue/destination '${destination}'...`);

        try {

            const sent = this.channel.sendToQueue(destination, payload, {
                persistent: true //  persistent by default
            });

            if (sent) {
                console.log(`✅ RabbitMQProducer: Message sent successfully to ${destination}.`);
            } else {
                console.warn(`🟡 RabbitMQProducer: Message sending to ${destination} returned false (buffer likely full). Retrying might be needed.`);
                throw new Error('Failed to send message, possibly due to buffer full.');
            }
        } catch (error: any) {
            console.error(`🔴 RabbitMQProducer: Error sending message to ${destination}:`, error);
            throw error;
        }
    }

    isConnected(): boolean {
        return this.isConnectedState && !!this.connection && !!this.channel;
    }
}