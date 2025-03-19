import {Card, CardDescription, CardHeader, CardTitle} from "~/components/ui/card";
import {cn} from "~/lib/utils";
import {AlertCircle, Check, HelpCircle, Key, Server} from "lucide-react";
import React from "react";
import {Badge} from "~/components/ui/badge";

const ERROR_MESSAGES = {
    400: "Error en la solicitud. Por favor, verifica el formato de los datos enviados.",
    401: "Error de autenticación. Verifica que estés usando un API_KEY válido.",
    403: "Acceso denegado. No tienes permiso para realizar esta acción.",
    404: "Recurso no encontrado. Verifica la URL del servidor.",
    429: "Demasiadas solicitudes. Espera unos minutos antes de intentar nuevamente.",

    // Errores de servidor (500-599)
    502: "Error de puerta de enlace. El servidor está temporalmente caído o en mantenimiento.",
    503: "Servicio no disponible. El servidor está sobrecargado o en mantenimiento.",
    504: "Tiempo de espera agotado. Verifica la conectividad con el servidor."
};

function getRecommendation(status: number, message: string): {
    title: string;
    description: string;
    icon: React.ReactNode
} {

    const lowerMessage = message.toLowerCase();

    if (status === 401 || status === 403) {
        return {
            title: "Error de autenticación",
            description: "El API Key proporcionado no es válido o ha expirado. Verifica tus credenciales.",
            icon: <Key size={20}/>
        };
    }

    if (status === 400 || lowerMessage.includes("formato") || lowerMessage.includes("inválido")) {
        return {
            title: "Formato de datos incorrecto",
            description: "La estructura de los datos enviados no es válida. Verifica el formato JSON y los campos requeridos.",
            icon: <AlertCircle size={20}/>
        };
    }

    if (status >= 500) {
        return {
            title: "Error del servidor",
            description: "Posible problema de CORS o conexión de red. Verifica el string de conexión y que el servidor permita solicitudes desde esta aplicación.",
            icon: <Server size={20}/>
        };
    }

    if (status >= 200 && status < 300) {
        return {
            title: "Solicitud exitosa",
            description: "Los datos de la ultima solicitud fueron enviados correctamente al servidor.",
            icon: <Check size={20}/>
        };
    }

    // Caso por defecto
    return {
        title: "Estado desconocido",
        description: ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] || "Estado de respuesta desconocido. Código: " + status,
        icon: <HelpCircle size={20}/>
    };
}

export function StatusCard({lastResponse}: { lastResponse: { status: number; message: string } | null }) {
    if (!lastResponse) {
        return (
            <Card className="w-full bg-muted/20 h-[7rem]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-muted-foreground"/>
                        <span>Resultado de la última solicitud</span>
                    </CardTitle>
                    <CardDescription className={"text-sm"}>
                        Aquí se mostrará el resultado de la última solicitud enviada al servidor
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const isSuccessResponse = lastResponse.status >= 200 && lastResponse.status < 300;
    const recommendation = getRecommendation(lastResponse.status, lastResponse.message || "");

    return (
        <Card className={cn(
            "w-full h-[7rem]",
            isSuccessResponse ? "bg-transparent border-border" : "bg-destructive/5 border-destructive/10"
        )}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between gap-2">
                    <div className={"flex gap-2 items-center"}>
                        <span
                            className={cn("text-green-700",
                                !isSuccessResponse && "text-destructive")
                        }>
                            {recommendation.icon}
                        </span>
                        <span>{recommendation.title}</span>
                    </div>
                    <Badge
                        className={"font-semibold"}
                        variant={isSuccessResponse ? "default" : "destructive"}>
                        {lastResponse.status}
                    </Badge>
                </CardTitle>
                <CardDescription className={"text-sm"}>
                    {recommendation.description}
                </CardDescription>
            </CardHeader>
        </Card>
    );
}