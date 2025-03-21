import {z} from 'zod';

export const sensorCategorySchema = z.enum([
    'temperature',
    'pressure',
    'motion',
    'voltage',
    'custom'
]);

export const temperatureSensorDataSchema = z.object({
    temperature: z.number(),
    humidity: z.number(),
    timestamp: z.string()
});

export const pressureSensorDataSchema = z.object({
    pressure: z.number(),
    altitude: z.number(),
    timestamp: z.string()
});

export const motionSensorDataSchema = z.object({
    motion_detected: z.boolean(),
    distance: z.number(),
    timestamp: z.string()
});

export const voltageSensorDataSchema = z.object({
    voltage: z.number(),
    current: z.number(),
    timestamp: z.string()
});

export const customSensorDataSchema = z.object({
    value: z.number(),
    timestamp: z.string()
}).catchall(z.any());

export const sensorDataSchema = z.union([
    temperatureSensorDataSchema,
    pressureSensorDataSchema,
    motionSensorDataSchema,
    voltageSensorDataSchema,
    customSensorDataSchema
]);

export const sensorPayloadSchema = z.object({
    api_key: z.string(),
    json_data: z.array(sensorDataSchema)
});


export const sensorDataTypeMapSchema = z.object({
    temperature: temperatureSensorDataSchema,
    pressure: pressureSensorDataSchema,
    motion: motionSensorDataSchema,
    voltage: voltageSensorDataSchema,
    custom: customSensorDataSchema
});


export type SensorCategory = z.infer<typeof sensorCategorySchema>;
export type TemperatureSensorData = z.infer<typeof temperatureSensorDataSchema>;
export type PressureSensorData = z.infer<typeof pressureSensorDataSchema>;
export type MotionSensorData = z.infer<typeof motionSensorDataSchema>;
export type VoltageSensorData = z.infer<typeof voltageSensorDataSchema>;
export type CustomSensorData = z.infer<typeof customSensorDataSchema>;
export type SensorData = z.infer<typeof sensorDataSchema>;
export type SensorPayload = z.infer<typeof sensorPayloadSchema>;
export type SensorDataTypeMap = z.infer<typeof sensorDataTypeMapSchema>;


