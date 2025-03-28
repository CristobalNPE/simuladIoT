import type {Route} from "./+types/send-message-to-broker";
import {connectionStorageService} from "~/routes/settings/services/connection-storage.service";
import type {SensorType} from "~/routes/devices/schemas/sensor.schema";
import {sendDeviceData} from "~/routes/devices/services/message-sending.server";

export async function action({request}: Route.ActionArgs) {

    const formData = await request.formData();
    const payload = formData.get("payload") as string;
    const sensorType = formData.get("sensorType") as SensorType;

    switch (sensorType) {
        case "ESP32": {
            const httpConnectionSettings = await connectionStorageService.getHttpConnectionSettingsFromRequest(request);
            await sendDeviceData(payload, httpConnectionSettings);
            break;
        }
        case "ZIGBEE": {
            const brokerConnectionSettings = await connectionStorageService.getBrokerConnectionSettingsFromRequest(request);
            await sendDeviceData(payload, brokerConnectionSettings);
            break;
        }
        default: {
            throw new Error("Unsupported sensor type");
        }
    }
}
