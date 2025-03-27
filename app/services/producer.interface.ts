export interface MessageProducer {
    connect(): Promise<void>;

    disconnect(): Promise<void>;

    sendMessage(destination: string, message: any, options?: any): Promise<void>;

    isConnected(): boolean;
}

export interface ProducerConfig {
    connectionString: string;
    clientId?: string;
    username?: string;
    password?: string;

    ssl?: boolean;
    timeout?: number;
}