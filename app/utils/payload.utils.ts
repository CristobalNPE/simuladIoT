export const SAMPLE_API_KEY = "API_KEY_SIN_DEFINIR"

export function generateSampleData(category: string) {
    let sampleData: Record<string, any> = {}

    switch (category) {
        case "temperature":
            sampleData = {
                temperature: Number.parseFloat((Math.random() * 30 + 10).toFixed(1)),
                humidity: Number.parseFloat((Math.random() * 50 + 30).toFixed(1)),
            }
            break
        case "pressure":
            sampleData = {
                pressure: Number.parseFloat((Math.random() * 100 + 900).toFixed(1)),
                altitude: Number.parseFloat((Math.random() * 100).toFixed(1)),
            }
            break
        case "motion":
            sampleData = {
                motion_detected: Math.random() > 0.5,
                distance: Number.parseFloat((Math.random() * 10).toFixed(2)),
            }
            break
        case "voltage":
            sampleData = {
                voltage: Number.parseFloat((Math.random() * 5 + 1).toFixed(2)),
                current: Number.parseFloat((Math.random() * 2).toFixed(2)),
            }
            break
        default:
            sampleData = {
                value: Number.parseFloat((Math.random() * 100).toFixed(1)),
            }
    }

    sampleData.timestamp = new Date().toISOString()
    return sampleData
}


export function generateSamplePayload(category: string, apiKey: string) {
    const sampleData = generateSampleData(category)

    return {
        api_key: apiKey,
        json_data: [sampleData],
    }
}

export function updateTimestamps(payload: any) {
    if (!payload || !payload.json_data) return payload

    const updatedPayload = {...payload}

    if (Array.isArray(updatedPayload.json_data)) {
        updatedPayload.json_data = updatedPayload.json_data.map((data: any) => ({
            ...data,
            timestamp: new Date().toISOString()
        }))
    }

    return updatedPayload
}

export function updateApiKey(payload: any, apiKey: string) {
    if (!payload) return payload
    return {...payload, api_key: apiKey}
}

export function validatePayload(jsonString: string): {
    valid: boolean;
    payload?: any;
    error?: string
} {
    try {
        const payload = JSON.parse(jsonString)

        if (!payload.api_key || payload.api_key === SAMPLE_API_KEY) {
            return {valid: false, error: "Missing API key"}
        }

        if (!payload.json_data || !Array.isArray(payload.json_data)) {
            return {valid: false, error: "Invalid or missing json_data array"}
        }

        return {valid: true, payload}
    } catch (error) {
        return {valid: false, error: "Invalid JSON format"}
    }
}

export function preparePayloadForSending(jsonString: string, apiKey: string): {
    valid: boolean;
    payload?: any;
    updatedPayloadString?: string;
    error?: string;
} {
    const validation = validatePayload(jsonString)

    if (!validation.valid) {
        return {valid: false, error: validation.error}
    }

    let updatedPayload = updateApiKey(validation.payload, apiKey)
    updatedPayload = updateTimestamps(updatedPayload)

    return {
        valid: true,
        payload: updatedPayload,
        updatedPayloadString: JSON.stringify(updatedPayload, null, 2)
    }
}