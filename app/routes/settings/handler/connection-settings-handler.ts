import {parseWithZod} from "@conform-to/zod";
import {z} from "zod";
import {data} from "react-router";

type ApplyMethod<T, R = any> = (value: T) => Promise<R> | R;


export function createActionHandler<T>(
    schema: z.ZodSchema<T>,
    applyMethod: ApplyMethod<T>
) {
    return async (formData: FormData) => {
        const submission = parseWithZod(formData, {schema});
        console.log(submission)
        if (submission.status !== "success") {
            return data(
                {result: submission.reply()},
                {status: submission.status !== "error" ? 400 : 200}
            );
        }


        await applyMethod(submission.value);

        const dataResult = submission.reply();
        const withReset = submission.reply({resetForm: true});

        return {
            result: {
                ...dataResult,
                ...withReset,
            },
        };

    }


}

// type HandlerFunction = (formData: FormData) => Promise<any>;
//
// type CasesMap = Record<string, HandlerFunction>;

