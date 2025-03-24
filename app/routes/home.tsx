import type {Route} from "./+types/home";
import {redirect} from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "SimulaDIoT - Simulador Dispositivos de IOT"},
        {name: "description", content: "Simula dispositivos IOT y envía datos a tu API"},
    ];
}



export async function loader({request}: Route.ClientLoaderArgs) {
    return redirect("/settings")
}

