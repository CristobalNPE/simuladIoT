import {Card, CardDescription, CardHeader, CardTitle,} from "~/components/ui/card"
import {cn} from "~/lib/utils";
import {Check, TriangleAlert} from "lucide-react";

export function StatusCard({lastResponse}: { lastResponse: { status: number; message: string } | null }) {

    if (!lastResponse) {
        return (
            <Card className={cn("flex")}>
                <CardHeader className={"flex justify-between"}>
                    <div className={"flex gap-4 items-center"}>
                        <div className={"h-10"}>

                        </div>
                        <div>
                            <CardTitle>Resultado del ultimo request</CardTitle>
                            <CardDescription>Aca se mostrara el resultado del ultimo request</CardDescription>
                        </div>
                    </div>
                    <div>
                        HELP
                    </div>

                </CardHeader>

            </Card>
        )
    }

    const isSuccessResponse = lastResponse.status >= 200 && lastResponse.status < 300

    return (
        <Card className={cn("flex")}>
            <CardHeader className={"flex justify-between"}>
                <div className={"flex gap-4 items-center"}>
                    <div className={"bg-primary size-10 rounded-md p-2 text-background"}>
                        {isSuccessResponse ? <Check/> : <TriangleAlert/>}
                    </div>
                    <div>
                        <CardTitle>{isSuccessResponse ? "Éxito" : "Error"}</CardTitle>
                        <CardDescription>Status: {lastResponse.status} - {lastResponse.message}</CardDescription>
                    </div>
                </div>
                <div>
                    HELP
                </div>

            </CardHeader>

        </Card>
    )
}
