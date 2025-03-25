import {type Sensor, SensorSchema, type SensorType, type UpdateSensor} from "~/routes/devices/schemas/sensor.schema";
import type {SensorCategory} from "~/routes/devices/schemas/sensor-types.schema";
import {generateSamplePayload} from "~/routes/devices/utils/payload.utils";
import {sensorDataService} from "~/routes/devices/services/sensor-data.service";
import {messageHistoryService} from "~/routes/devices/services/message-history.service";


export const DEFAULT_SENSOR_CATEGORY: SensorCategory = 'temperature';
const SENSORS_KEY = 'active_sensors';

const generateDeviceName = (sensorType: SensorType, sensorId: string) => {
    return `Sensor ${sensorType === "ESP32" ? "ESP32" : "Zigbee"}-[${sensorId.slice(-4)}]`
}


const DEFAULT_MEASUREMENTS_COUNT = 1;
export const sensorService = {

    createNewSensor({sensorType, apiKey, category}: {
        sensorType: SensorType,
        apiKey: string,
        category: SensorCategory
    }): void {

        const sensorId = Date.now().toString();
        let payload = generateSamplePayload(category, apiKey, DEFAULT_MEASUREMENTS_COUNT);

        const newSensor: Sensor = {
            id: sensorId,
            name: generateDeviceName(sensorType, sensorId),
            type: sensorType,
            measurementsCount: DEFAULT_MEASUREMENTS_COUNT,
            category,
            apiKey,
            payload,
            createdAt: new Date().toISOString()
        }

        const allSensors = this.getAllSensors();
        const allSensorsString = JSON.stringify([...allSensors, newSensor], null, 2);
        localStorage.setItem(SENSORS_KEY, allSensorsString);

    },

    getAllSensors(): Sensor[] {
        const sensors = localStorage.getItem(SENSORS_KEY);
        if (!sensors) {
            return [];
        }

        try {
            const parsedSensors = JSON.parse(sensors);

            if (!Array.isArray(parsedSensors)) {
                console.error("Stored sensors are not an array");
                return [];
            }

            const validSensors: Sensor[] = [];

            for (const sensor of parsedSensors) {
                try {
                    const validatedSensor = SensorSchema.parse(sensor);
                    validSensors.push(validatedSensor);
                } catch (parseError) {
                    console.error("Error parsing sensor:", sensor, parseError);
                    //skip
                }
            }
            return validSensors.sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
        } catch (error) {
            console.error("Error parsing stored sensors from local storage:", error);
            return [];
        }
    },

    getSensorById(id: string): Sensor | null {
        const allSensors = this.getAllSensors();
        const sensor = allSensors.find(sensor => sensor.id === id);
        return sensor || null;
    },


    updateSensor(updatedSensor: Sensor) {
        try {
            const validatedSensor = SensorSchema.parse(updatedSensor);

            const allSensors = this.getAllSensors();
            const sensorIndex = allSensors.findIndex(sensor => sensor.id === validatedSensor.id);

            if (sensorIndex === -1) {
                console.error(`Sensor with ID ${validatedSensor.id} not found`);
            }
            allSensors[sensorIndex] = validatedSensor;
            localStorage.setItem(SENSORS_KEY, JSON.stringify(allSensors, null, 2));
        } catch (error) {
            console.error("Error updating sensor:", error);
        }
    },

    updateSensorData(updatedSensor: UpdateSensor): void {
        const sensorToUpdate = this.getSensorById(updatedSensor.id);

        if (!sensorToUpdate) {
            console.error(`Sensor with ID ${updatedSensor.id} not found`);
            return;
        }

        const updatedPayload = generateSamplePayload(updatedSensor.category, updatedSensor.apiKey, updatedSensor.measurementsCount);

        const newSensor = {
            ...sensorToUpdate,
            name: updatedSensor.name,
            category: updatedSensor.category,
            measurementsCount: updatedSensor.measurementsCount,
            type: updatedSensor.sensorType,
            apiKey: updatedSensor.apiKey,
            payload: updatedPayload
        };

        const allSensors = this.getAllSensors().filter(sensor => sensor.id !== updatedSensor.id);

        const allSensorsString = JSON.stringify([...allSensors, newSensor], null, 2);
        localStorage.setItem(SENSORS_KEY, allSensorsString);
    },

    deleteSensor(id: string) {
        const allSensors = this.getAllSensors();
        const initialLength = allSensors.length;
        ///
        sensorDataService.stopAutoSend(id);
        messageHistoryService.clearHistoryForSensor(id);
        ///

        const filteredSensors = allSensors.filter(sensor => sensor.id !== id);

        if (filteredSensors.length === initialLength) {
            console.error(`Sensor with ID ${id} not found`);
        }

        localStorage.setItem(SENSORS_KEY, JSON.stringify(filteredSensors, null, 2));
    }
}