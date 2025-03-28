import {
    type CreateSensor,
    type Sensor,
    SensorSchema,
    type SensorType,
    type UpdateSensor
} from "~/routes/devices/schemas/sensor.schema";
import type {Session} from "react-router";
import {commitSession, getSession} from "~/routes/settings/sessions/session-storage.server";
import {generateSamplePayload} from "~/routes/devices/utils/payload.utils";
import type {SensorModifyPayload} from "../schemas/sensor-data.schema";

const SENSORS_KEY = "session_sensors";
const DEFAULT_MEASUREMENTS_COUNT = 1;

type SensorsMap = Record<string, Sensor>;

const generateDeviceName = (sensorType: SensorType, sensorId: string): string => {
    return `Sensor ${sensorType === "ESP32" ? "ESP32" : "Zigbee"}-[${sensorId.slice(-4)}]`
}

const getSensorsFromSession = (session: Session): SensorsMap => {
    return session.get(SENSORS_KEY) || {};
}

export const sensorSessionService = {

    /**
     * Retrieves all sensors from the current user's session.
     * Should be called within a loader or action.
     */
    async getAllSensors(request: Request): Promise<Sensor[]> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);
        const sensorsArray = Object.values(sensorsMap);

        //validate sensors
        const validSensors: Sensor[] = [];
        for (const sensorData of sensorsArray) {
            try {
                const validatedSensor = SensorSchema.parse(sensorData);
                validSensors.push(validatedSensor);
            } catch (parseError) {
                console.error("Session contains invalid sensor data: ", sensorData, parseError);
                //skip? throw?
            }
        }

        return validSensors.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    },

    /**
     * Retrieves a single sensor by ID from the current user's session.
     * Should be called within a loader or action.
     */
    async getSensorById(request: Request, id: string): Promise<Sensor | null> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);
        const sensorData = sensorsMap[id];

        if (!sensorData) {
            return null;
        }

        try {
            return SensorSchema.parse(sensorData);
        } catch (parseError) {
            console.error("Session contains invalid sensor data for ID:", id, sensorData, parseError);
            return null;
        }
    },

    /**
     * Creates a new sensor and saves it to the session.
     * Should be called within an action. Returns headers for committing the session.
     */
    async createNewSensor(request: Request, sensorData: CreateSensor): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);

        const sensorId = Date.now().toString();
        const payload = generateSamplePayload(sensorData.category, sensorData.apiKey, DEFAULT_MEASUREMENTS_COUNT);

        const newSensor: Sensor = {
            id: sensorId,
            name: generateDeviceName(sensorData.sensorType, sensorId),
            type: sensorData.sensorType,
            measurementsCount: DEFAULT_MEASUREMENTS_COUNT,
            category: sensorData.category,
            apiKey: sensorData.apiKey,
            payload,
            createdAt: new Date().toISOString()
        };

        const validatedSensor = SensorSchema.parse(newSensor);

        sensorsMap[validatedSensor.id] = validatedSensor;
        session.set(SENSORS_KEY, sensorsMap);

        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        return {headers};
    },

    /**
     * Updates an existing sensor in the session.
     * Requires the full updated sensor object.
     * Should be called within an action. Returns headers for committing the session.
     */
    async updateSensor(request: Request, updatedSensor: Sensor): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);

        try {
            const validatedSensor = SensorSchema.parse(updatedSensor);

            if (!sensorsMap[validatedSensor.id]) {
                throw new Error(`Sensor with ID ${validatedSensor.id} not found in session.`);
            }

            sensorsMap[validatedSensor.id] = validatedSensor;
            session.set(SENSORS_KEY, sensorsMap);

            const headers = new Headers({"Set-Cookie": await commitSession(session)});
            return {headers};
        } catch (error) {
            console.error("Error validating or updating sensor in session:", error);
            throw error instanceof Error ? error : new Error("Failed to update sensor");
        }
    },

    /**
     * Updates specific data fields of an existing sensor in the session.
     * Regenerates the payload based on new category/apiKey/count.
     * Should be called within an action. Returns headers for committing the session.
     */
    async updateSensorData(request: Request, updateData: UpdateSensor): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);

        const sensorToUpdate = sensorsMap[updateData.id];
        if (!sensorToUpdate) {
            throw new Error(`Sensor with ID ${updateData.id} not found in session.`);
        }

        const updatedPayload = generateSamplePayload(
            updateData.category,
            updateData.apiKey,
            updateData.measurementsCount
        )

        const newSensorData: Sensor = {
            ...sensorToUpdate,
            name: updateData.name,
            category: updateData.category,
            measurementsCount: updateData.measurementsCount,
            type: updateData.sensorType,
            apiKey: updateData.apiKey,
            payload: updatedPayload
        };

        try {
            const validatedSensor = SensorSchema.parse(newSensorData);
            sensorsMap[validatedSensor.id] = validatedSensor;
            session.set(SENSORS_KEY, sensorsMap);

            const headers = new Headers({"Set-Cookie": await commitSession(session)});
            return {headers};
        } catch (error) {
            console.error("Error validating or updating sensor data in session:", error);
            throw error instanceof Error ? error : new Error("Failed to update sensor data");
        }
    },

    /**
     * Updates only the payload of an existing sensor in the session.
     * Parses the incoming payload string.
     * Should be called within an action. Returns headers for committing the session.
     */
    async updateSensorPayload(request: Request, modifyPayload: SensorModifyPayload): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);

        const sensorToUpdate = sensorsMap[modifyPayload.sensorId];
        if (!sensorToUpdate) {
            throw new Error(`Sensor with ID ${modifyPayload.sensorId} not found in session.`);
        }

        try {
            const parsedPayload = JSON.parse(modifyPayload.sensorData);

            const newSensorData: Sensor = {
                ...sensorToUpdate,
                payload: parsedPayload
            };

            const validatedSensor = SensorSchema.parse(newSensorData);

            sensorsMap[validatedSensor.id] = validatedSensor;
            session.set(SENSORS_KEY, sensorsMap);

            const headers = new Headers({"Set-Cookie": await commitSession(session)});
            return {headers};

        } catch (error) {
            console.error(`Error parsing or updating sensor payload in session:`, error);
            throw new Error("Invalid payload format or failed to update sensor payload.");
        }
    },


    /**
     * Regenerates the payload of a sensor in the session.
     * Should be called within an action. Returns headers for committing the session.
     */
    async regenerateSensorPayload(request: Request, sensorId: string): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);

        const sensorToUpdate = sensorsMap[sensorId];
        if (!sensorToUpdate) {
            throw new Error(`Sensor with ID ${sensorId} not found in session.`);

        }

        const updatedPayload = generateSamplePayload(
            sensorToUpdate.category,
            sensorToUpdate.apiKey,
            sensorToUpdate.measurementsCount
        )

        const newSensorData: Sensor = {
            ...sensorToUpdate,
            payload: updatedPayload
        };

        try {
            const validatedSensor = SensorSchema.parse(newSensorData);
            sensorsMap[validatedSensor.id] = validatedSensor;
            session.set(SENSORS_KEY, sensorsMap);

            const headers = new Headers({"Set-Cookie": await commitSession(session)});
            return {headers};
        } catch (error) {
            console.error("Error validating or regenerating payload in session:", error);
            throw error instanceof Error ? error : new Error("Failed to regenerate payload");
        }
    },


    /**
     * Deletes a sensor from the session.
     * Should be called within an action. Returns headers for committing the session.
     * Note: Associated client-side cleanup (stopAutoSend, clearHistory) must be handled separately.
     */
    async deleteSensor(request: Request, id: string): Promise<{ headers: Headers }> {
        const session = await getSession(request.headers.get("Cookie"));
        const sensorsMap = getSensorsFromSession(session);

        if (!sensorsMap[id]) {
            console.warn(`Attempted to delete non-existent sensor ID ${id} from session.`);
            return {headers: new Headers()};
        }

        delete sensorsMap[id];
        session.set(SENSORS_KEY, sensorsMap);

        const headers = new Headers({"Set-Cookie": await commitSession(session)});
        return {headers};
    }


}