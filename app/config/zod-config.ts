import { z } from "zod";

z.setErrorMap((issue, ctx) => {

    if (issue.code === "invalid_type" && issue.received === "undefined") {
        return { message: "Campo requerido" };
    }
    return { message: ctx.defaultError };


});

