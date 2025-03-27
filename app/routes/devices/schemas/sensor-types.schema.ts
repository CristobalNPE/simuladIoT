import {z} from 'zod';

export const sensorCategorySchema = z.enum([
    'temperature',
    'pressure',
    'motion',
    'voltage',
    'custom'
]);

const baseSensorDataSchema = z.object({
    timestamp: z.string()
}).catchall(z.any()); // allow any additional fields

export const temperatureSensorDataSchema = baseSensorDataSchema.extend({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
});

export const pressureSensorDataSchema = baseSensorDataSchema.extend({
    pressure: z.number().optional(),
    altitude: z.number().optional(),
});

export const motionSensorDataSchema = baseSensorDataSchema.extend({
    motion_detected: z.boolean().optional(),
    distance: z.number().optional(),
});

export const voltageSensorDataSchema = baseSensorDataSchema.extend({
    voltage: z.number().optional(),
    current: z.number().optional(),
});

export const customSensorDataSchema = baseSensorDataSchema.extend({
    value: z.number().optional(),
});

export const sensorDataSchema = z.object({}).catchall(z.any()).refine(
    data => {
        return typeof data.timestamp === 'string';
    },
    {
        message: "Los datos del sensor deben incluir un campo 'timestamp'"
    }
);

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