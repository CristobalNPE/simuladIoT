import type {MessageProducer, ProducerConfig} from "~/services/producer.interface";


export class ActiveMQHttpProducer implements MessageProducer {

    private config: ProducerConfig;
    private isConnectedState: boolean = false;
    private baseApiUrl: string;
    private authHeader: string | null = null;

    constructor(config: ProducerConfig) {
        if (!config.connectionString) {
            throw new Error("ActiveMQHttpProducer requires 'connectionString' (the base API URL) in config.");
        }
        if (!config.username || !config.password) {
            console.warn("🟠 ActiveMQHttpProducer: Username or password missing. Authentication will likely fail.");
        }

        this.config = {
            ...config,
            defaultDestinationType: config.defaultDestinationType ?? 'topic'
        };

        this.baseApiUrl = this.config.connectionString.replace(/\/$/, ''); // make sure base URL doesn't have trailing slashes for easier joining later

        if (this.config.username && this.config.password) {
            this.authHeader = `Basic ${Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64')}`;
        }

    }



    async connect(): Promise<void> {
        if (this.isConnectedState) {
            console.log("🔵 ActiveMQHttpProducer: Already connected (verified).");
            return;
        }
        const pingUrl = `${this.baseApiUrl}/api/`; // Adjust if a better health/ping endpoint exists
        const headers: HeadersInit = { 'Accept': '*/*' };
        if (this.authHeader) {
            headers['Authorization'] = this.authHeader;
        }

        console.log(`⚪ ActiveMQHttpProducer: Verifying connection to ${pingUrl}...`);

        try {
            const response = await fetch(pingUrl, {
                method: 'HEAD', // HEAD is lightweight, just checks existence and headers/auth
                headers: headers,
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined
            });

            if (!response.ok) {
                // Auth errors (401, 403) or Not Found (404) are common failed connection indicators
                throw new Error(`Connection verification failed. Status: ${response.status} ${response.statusText}`);
            }

            console.log(`🟢 ActiveMQHttpProducer: Connection verified successfully.`);
            this.isConnectedState = true;

        } catch (error: any) {
            console.error(`🔴 ActiveMQHttpProducer: Connection verification failed.`, error);
            this.isConnectedState = false;
            // Re-throw a more specific error
            throw new Error(`Failed to connect/verify ActiveMQ REST endpoint at ${this.baseApiUrl}: ${error.message}`);
        }

    }
    async disconnect(): Promise<void> {
        if (this.isConnectedState) {
            console.log("👋 ActiveMQHttpProducer: Disconnecting (resetting state).");
        }
        this.isConnectedState = false;
        return Promise.resolve();
    }
    async sendMessage(destination: string, message: any): Promise<void> {
        if (!this.isConnectedState) {
            // Optionally, you could try to auto-connect here, but explicit connect is often better
            throw new Error("Producer not connected. Call connect() first to verify endpoint.");
        }

        const destType = this.config.defaultDestinationType;
        const apiUrl = `${this.baseApiUrl}/api/message/${encodeURIComponent(destination)}?type=${destType}`;

        const headers: HeadersInit = {
            // Assume text/plain unless message suggests otherwise (e.g., is object)
            'Content-Type': typeof message === 'string' ? 'text/plain' : 'application/json',
            'Accept': '*/*'
        };
        if (this.authHeader) {
            headers['Authorization'] = this.authHeader;
        }

        // Prepare body - stringify if not already a string
        const body = typeof message === 'string' ? message : JSON.stringify(message);

        console.log(`📤 ActiveMQHttpProducer: Sending message via POST to ${apiUrl}`);

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: headers,
                body: body,
                signal: this.config.timeout ? AbortSignal.timeout(this.config.timeout) : undefined
            });

            if (!response.ok) {
                let errorBody = `Status Code: ${response.status} ${response.statusText}`;
                try {
                    const text = await response.text();
                    errorBody += ` | Body: ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`;
                } catch { /* Ignore body read error */ }
                throw new Error(`Failed to send message. ${errorBody}`);
            }

            console.log(`✅ ActiveMQHttpProducer: Message sent successfully (Status ${response.status}).`);
            // Resolve on success
            return Promise.resolve();

        } catch (error: any) {
            console.error(`🔴 ActiveMQHttpProducer: Failed to send message to ${destination}.`, error);
            // Re-throw the specific error from fetch or the error created above
            throw error;
        }
    }
    isConnected(): boolean {
        throw new Error("Method not implemented.");
    }


}