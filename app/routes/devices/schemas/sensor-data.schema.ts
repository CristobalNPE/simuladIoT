import {z} from "zod";
import {SensorTypeSchema} from "~/routes/devices/schemas/sensor.schema";

export const sensorDataSentSchema = z.object({
    sensorId: z.string(),
    sensorType: SensorTypeSchema,
    apiKey: z.string(),
    sensorData: z.string()
});

export const sendDataResultSchema = z.object({
    success: z.boolean(),
    payload: z.string(),
    status: z.number().optional(),
    message: z.string().optional(),
    updatedPayload: z.string().optional()
})

export type SensorDataSent = z.infer<typeof sensorDataSentSchema>;
export type SentDataResult = z.infer<typeof sendDataResultSchema>;