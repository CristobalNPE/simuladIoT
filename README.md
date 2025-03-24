# SimulaDIoT - Simulador de Dispositivos IoT

Aplicación web para simular dispositivos IoT (ESP32 y Zigbee) y enviar datos a APIs mediante protocolos REST y MQTT.

![Logo de SimulaDIoT](app/assets/simuladiot-logo.svg)

## Características Principales
- 🛠 Simula dispositivos ESP32 (HTTP) y Zigbee (MQTT)
- ⚡ Prueba conexiones en tiempo real
- 📊 Historial de mensajes con detalles de payloads
- 📡 Variación realista en valores de sensores

## Cómo Utilizar
1. **Configurar Conexión**
   - Ingresa detalles de tu servidor (dominio/puerto/topic)
   - Prueba la conectividad con el botón "Probar Conexión"

2. **Agregar Dispositivos**
   - Simula dispositivos ESP32 o Zigbee
   - Utiliza la API key generada por tu servidor para enviar solicitudes validas.
   - Personaliza nombre y categoría de sensor

3. **Enviar Datos**
   - Genera payloads de ejemplo para diferentes tipos de sensores
   - Envía manualmente o programa envíos automáticos

4. **Monitorear Resultados**
   - Revisa el historial de mensajes
   - Analiza códigos de estado y respuestas del servidor
  
5. **Persistencia**
   - Los datos de conexión y configurarción de dispositivos se guardan en tu navegador.
  
## Reportar Problemas
¿Encontraste un error?

1. Ve al [sección de Issues](https://github.com/CristobalNPE/simuladIoT/issues) del repositorio
2. Haz clic en **New Issue**
3. Puedes incluir:
   ```markdown
   - Descripción clara del problema
   - Pasos para reproducirlo
   - Comportamiento esperado vs actual
   - Capturas de pantalla (opcional pero útil)
   - Entorno: Navegador, SO, versión de la app
