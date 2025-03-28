import {z} from "zod";


export function configureZodErrorMap() {
    z.setErrorMap((issue, ctx) => {

        if (issue.code === "invalid_type" && issue.received === "undefined") {
            return {message: "Campo requerido"};
        }
        return {message: ctx.defaultError};
    });
}