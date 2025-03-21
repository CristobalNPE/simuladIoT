import {z} from "zod";

export const messageSchema = z.object({
    id: z.string(),
    timestamp: z.string(),
    request: z.object({
        api_key: z.string(),
        json_data: z.array(z.any())
    }),
    response: z.object({
        status: z.number(),
        message: z.string(),
        timestamp: z.string()
    })
})

export type Message = z.infer<typeof messageSchema>;