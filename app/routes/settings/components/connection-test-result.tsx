import {AlertTriangle, CheckCircle, Unplug, XCircle} from "lucide-react";
import {Button} from "~/components/ui/button";
import {cn} from "~/lib/utils";
import type {TestConnectionResult} from "~/routes/api/types/connection-test.types";


interface ConnectionTestResultProps {
    handleTestConnection: () => void;
    isTesting: boolean;
    isSaving: boolean; // to disable when parent is saving
    testResult: TestConnectionResult | null | undefined;//data from fetcher?

}

export function ConnectionTestResult({
                                         handleTestConnection,
                                         isTesting,
                                         isSaving,
                                         testResult
                                     }: ConnectionTestResultProps) {


    const getStatusIcon = (status:TestConnectionResult['status']) => {
        switch (status) {
            case 'success':
                return <CheckCircle className="h-4 w-4 mr-1 inline-block"/>;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 mr-1 inline-block"/>;
            case 'error':
                return <XCircle className="h-4 w-4 mr-1 inline-block"/>;
            default:
                return null;
        }
    };


    return (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center my-4">
            <Button
                type="button"
                onClick={handleTestConnection}
                variant="outline"
                className="flex items-center gap-2 flex-shrink-0"
                disabled={isTesting || isSaving}
            >
                <Unplug className="h-4 w-4"/>
                {isTesting ? "Probando..." : "Probar Conexión"}
            </Button>

            {!isTesting && testResult && (
                <div className={cn(
                    "px-3 py-1 rounded text-sm flex-grow min-w-0 break-words",
                    testResult.status === 'success' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
                    testResult.status === 'warning' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
                    testResult.status === 'error' && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                )}>
                    {getStatusIcon(testResult.status)}
                    {testResult.message}
                </div>
            )}
            {(isTesting || !testResult) && <div className="flex-grow"></div>}
        </div>
    )

}