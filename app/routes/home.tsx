import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Simulador Dispositivos IOT" },
    { name: "description", content: "Simula dispositivos IOT y envía datos a tu API" },
  ];
}

export default function Home() {
  return (
      <div>
        IOT
      </div>
  );
}
