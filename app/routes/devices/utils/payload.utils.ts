import type {
    MotionSensorData,
    SensorCategory,
    SensorDataTypeMap,
    SensorPayload
} from "~/routes/devices/schemas/sensor-types.schema";

export function generateSampleData<T extends SensorCategory>(category: T): SensorDataTypeMap[T] {
    const timestamp = new Date().toISOString();

    switch (category) {
        case "temperature":
            return {
                temperature: Number.parseFloat((Math.random() * 30 + 10).toFixed(1)),
                humidity: Number.parseFloat((Math.random() * 50 + 30).toFixed(1)),
                timestamp
            } as SensorDataTypeMap[T];

        case "pressure":
            return {
                pressure: Number.parseFloat((Math.random() * 100 + 900).toFixed(1)),
                altitude: Number.parseFloat((Math.random() * 100).toFixed(1)),
                timestamp
            } as SensorDataTypeMap[T];

        case "motion":
            return {
                motion_detected: Math.random() > 0.5,
                distance: Number.parseFloat((Math.random() * 10).toFixed(2)),
                timestamp
            } as SensorDataTypeMap[T];

        case "voltage":
            return {
                voltage: Number.parseFloat((Math.random() * 5 + 1).toFixed(2)),
                current: Number.parseFloat((Math.random() * 2).toFixed(2)),
                timestamp
            } as SensorDataTypeMap[T];

        default:
            return {
                value: Number.parseFloat((Math.random() * 100).toFixed(1)),
                timestamp
            } as SensorDataTypeMap[T];
    }
}


export function generateBasePayload(category: SensorCategory, apiKey: string, measurementsCount: number): SensorPayload {

    const sampleData = generateSampleData(category)

    const allSampleData = [];
    for (let i = 0; i < measurementsCount; i++) {
        allSampleData.push(sampleData);
    }


    return {
        api_key: apiKey,
        json_data: allSampleData,
    }
}

export function generateSamplePayload(category: SensorCategory, apiKey: string, measurementsCount: number): SensorPayload {

    const baseSensorPayload = generateBasePayload(category, apiKey, measurementsCount);

    return addVarianceToPayload(baseSensorPayload, category);

}


export function addVarianceToPayload(payload: SensorPayload, category: SensorCategory): SensorPayload {

    if (!payload || !payload.json_data) return payload;
    const result = {...payload};

    // helper to add variance to a numeric value
    const addVariance = (value: number, percentVariance: number = 2) => {
        const variance = (Math.random() * 2 - 1) * (value * percentVariance / 100);
        return Number((value + variance).toFixed(2));
    };

    // apply variance to each item in json_data array
    if (Array.isArray(result.json_data)) {
        result.json_data = result.json_data.map(data => {
            const itemWithVariance = {...data};

            //special cases go here!!! TODO: add more
            if (category === 'motion' && 'motion_detected' in itemWithVariance && Math.random() > 0.8) {
                // 20% chance to change motion state
                (itemWithVariance as MotionSensorData).motion_detected =
                    !(itemWithVariance as MotionSensorData).motion_detected;
            }

            // for numbers: add variance
            Object.keys(itemWithVariance).forEach(key => {
                // @ts-ignore
                if (typeof itemWithVariance[key] === 'number' && key !== 'timestamp') {
                    // @ts-ignore
                    itemWithVariance[key] = addVariance(itemWithVariance[key]);
                }
            });

            return itemWithVariance;
        });
    }

    return result;
}