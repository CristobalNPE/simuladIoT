import {parseWithZod} from "@conform-to/zod";
import {z} from "zod";
import type {SubmissionResult} from "@conform-to/react";

type ApplyMethod<T> = (
    request: Request,
    value: T
) => Promise<{ headers: Headers }>;

interface HandlerResult {
    conformResult: SubmissionResult<any> | Record<string, any>;
    headers?: Headers;
}

export type RequestHandler = (request: Request, formData: FormData) => Promise<HandlerResult>

export function createActionHandler<T>(
    schema: z.ZodSchema<T>,
    applyMethod: ApplyMethod<T>
) {
    // this inner function is the actual handler invoked by the action
    return async (request: Request, formData: FormData): Promise<HandlerResult> => {
        const submission = parseWithZod(formData, {schema});
        console.log("Submission:", submission);

        if (submission.status !== "success") {
            return {conformResult: submission.reply()};
        }

        try {
            const serviceResult = await applyMethod(request, submission.value);
            const dataResult = submission.reply();
            const withReset = submission.reply({resetForm: true});

            return {
                conformResult: {...dataResult, ...withReset},
                headers: serviceResult.headers,
            }

        } catch (error) {
            console.error("Error during action handler applyMethod:", error);
            return {
                conformResult: submission.reply({
                    formErrors: [error instanceof Error ? error.message : "An unexpected error occurred."],
                }),
            };
        }
    }
}
