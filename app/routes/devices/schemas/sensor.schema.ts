import {z} from "zod";
import {sensorCategorySchema, sensorPayloadSchema} from "~/routes/devices/schemas/sensor-types.schema";


export const SensorTypeSchema = z.enum([
    'ESP32',
    'ZIGBEE'
])

export const SensorSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: SensorTypeSchema,
    measurementsCount: z.number().min(1, "Min. 1").max(20, "Max. 20"),
    category: sensorCategorySchema,
    apiKey: z.string(),
    payload: sensorPayloadSchema,
    createdAt: z.string().datetime(),
});

export const SensorStatusSchema = z.object({
    isSending: z.boolean(),
    isVariable: z.boolean(),
    intervalTime: z.number()
});

export const CreateSensorSchema = z.object({
    category: sensorCategorySchema,
    sensorType: SensorTypeSchema,
    apiKey: z.string(),
});

export const UpdateSensorSchema = z.object({
    id: z.string(),
    name: z.string(),
    measurementsCount: z.number().min(1, "Min. 1").max(20, "Max. 20"),
    category: sensorCategorySchema,
    sensorType: SensorTypeSchema,
    apiKey: z.string(),
});

export const DeleteSensorSchema = z.object({
    sensorId: z.string()
});


export type DeleteSensor = z.infer<typeof DeleteSensorSchema>;
export type SensorStatus = z.infer<typeof SensorStatusSchema>;
export type SensorType = z.infer<typeof SensorTypeSchema>;
export type Sensor = z.infer<typeof SensorSchema>;
export type CreateSensor = z.infer<typeof CreateSensorSchema>;
export type UpdateSensor = z.infer<typeof UpdateSensorSchema>;