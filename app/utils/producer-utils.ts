const DEFAULT_ACTIVEMQ_HTTP_PORT = 8161;
const DEFAULT_ACTIVEMQ_HTTP_SCHEME = 'http';

/**
 * Derives the likely ActiveMQ REST API base URL from a standard broker connection string.
 * Relies on default scheme (http) and port (8161).
 * @param brokerConnectionString - e.g., tcp://host:61616, stomp://host:61613
 * @returns The derived HTTP base URL (e.g., http://host:8161)
 * @throws Error if hostname cannot be parsed.
 */
export function deriveActiveMqHttpUrl(brokerConnectionString: string): string {
    console.log(`🟠 Attempting to derive ActiveMQ HTTP URL from: ${brokerConnectionString}`);
    try {
        const parsedUrl = new URL(brokerConnectionString);
        const hostname = parsedUrl.hostname;
        if (!hostname) {
            throw new Error("Hostname could not be extracted from the connection string.");
        }

        // Construct the assumed HTTP URL
        const derivedUrl = `${DEFAULT_ACTIVEMQ_HTTP_SCHEME}://${hostname}:${DEFAULT_ACTIVEMQ_HTTP_PORT}`;
        console.warn(`🟡 Automatically derived ActiveMQ HTTP URL as: ${derivedUrl}. This assumes defaults.`);
        return derivedUrl;

    } catch (parseError: any) {
        console.error(`🔴 Failed to parse connection string or derive hostname: ${brokerConnectionString}`, parseError);
        throw new Error(`Invalid connection string format provided for derivation: ${brokerConnectionString}. Error: ${parseError.message}`);
    }
}