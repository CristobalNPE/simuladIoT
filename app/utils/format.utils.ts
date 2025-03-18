export function formatJSONMessage(message: string) {
    try {
        return JSON.stringify(JSON.parse(message), null, 2);
    } catch (e) {
        return message;
    }
}