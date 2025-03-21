import type {ConnectionConfig, MqttConnection, RestConnection} from "~/types/connection.types";
import mqtt from "mqtt";
import {Badge} from "~/components/ui/badge";
import {toast} from "sonner";
import {useState} from "react";
import {
    type ConnectionSettings,
    type HttpConnectionSettings,
    isHttpConnectionSettings,
    isMqttConnectionSettings, type MqttConnectionSettings
} from "~/routes/settings/schemas/connection.schema";

async function testHttpConnection(settings: HttpConnectionSettings): Promise<{
    success: boolean;
    status?: number;
    message: string
}> {
    try {
        const baseUrl = `${settings.isLocal? 'http':'https'}://${settings.domain}:${settings.port}`;

        const response = await fetch(baseUrl, {
            method: "HEAD",
            mode: "no-cors",
            cache: "no-cache",
            signal: AbortSignal.timeout(5000),

        });

        return {
            success: response.status < 500,
            status: response.status,
            message: response.status < 500 ? "Servidor se encuentra disponible" : "Error en el servidor",

        };


    } catch (error) {
        return {
            success: false,
            message: 'Error en el servidor. Verifique la URL de conexión y que el servidor esté en funcionamiento.',
        }
    }
}

async function testMqttConnection(config: MqttConnectionSettings): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
        try {
            const url = `mqtt://${config.broker}:${config.port}`;
            const client = mqtt.connect(url, {
                clientId: `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
                connectTimeout: 5000,
            });

            const timeout = setTimeout(() => {
                client.end();
                resolve({
                    success: false,
                    message: 'El servidor MQTT no responde. Verifique la configuración de conexión.'
                });
            }, 5000);

            client.on('connect', () => {
                clearTimeout(timeout);
                client.end();
                resolve({success: true, message: 'Conexión activa y disponible para solicitudes.'});
            });

            client.on('error', (err) => {
                clearTimeout(timeout);
                client.end();
                resolve({success: false, message: `Error en la conexión: ${err.message}`});
            });

        } catch (error) {
            console.error("MQTT connection test failed:", error);
            resolve({
                success: false,
                message: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    });
}


export function useConnectionTesting() {
    const [isTestingConnection, setIsTestingConnection] = useState(false);

    const [httpConnectionResult, setHttpConnectionResult] = useState<{
        success?: boolean;
        status?: number;
        message?: string;
    }>({});
    const [mqttConnectionResult, setMqttConnectionResult] = useState<{
        success?: boolean;
        status?: number;
        message?: string;
    }>({});

    const testConnection = async (settings: ConnectionSettings) => {
        setIsTestingConnection(true);

        try {
            let result;

            if (isHttpConnectionSettings(settings)) {
                result = await testHttpConnection(settings as HttpConnectionSettings);
                setHttpConnectionResult(result);
                setMqttConnectionResult({});
            } else if (isMqttConnectionSettings(settings)) {
                result = await testMqttConnection(settings as MqttConnectionSettings);
                setMqttConnectionResult(result);
                setHttpConnectionResult({});
            } else {
                throw new Error("Tipo de conexión desconocido");
            }

            if (result.success) {
                toast.success(`Conexión activa y disponible para solicitudes.`)
            } else {
                toast.error(result.message)
            }
        } catch (error) {
            console.error("Connection test error:", error);
            toast.error("Conexión fallida")
        } finally {
            setIsTestingConnection(false);
        }
    };

    const ConnectionStatusBadge = ({type}: { type: 'http' | 'mqtt' }) => {
        const result = type === 'http' ? httpConnectionResult : mqttConnectionResult;

        if (isTestingConnection) {
            return <Badge variant="outline">Probando...</Badge>;
        }

        if (result.success === undefined) {
            return null;
        }

        return (
            <Badge variant={result.success ? "default" : "destructive"}>
                {result.status ? `${result.status}` :
                    result.success ? "Disponible ✔" : "No disponible ❌"}
            </Badge>
        );
    };

    return {
        testConnection,
        isTestingConnection,
        ConnectionStatusBadge
    };
}