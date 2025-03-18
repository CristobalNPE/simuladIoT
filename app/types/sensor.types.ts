export type SensorCategory =
    | 'temperature'
    | 'pressure'
    | 'motion'
    | 'voltage'
    | 'custom';

export interface TemperatureSensorData {
    temperature: number;
    humidity: number;
    timestamp: string;
}

export interface PressureSensorData {
    pressure: number;
    altitude: number;
    timestamp: string;
}

export interface MotionSensorData {
    motion_detected: boolean;
    distance: number;
    timestamp: string;
}

export interface VoltageSensorData {
    voltage: number;
    current: number;
    timestamp: string;
}

export interface CustomSensorData {
    value: number;
    timestamp: string;
    [key: string]: any; // anything 💩
}

export type SensorData =
    | TemperatureSensorData
    | PressureSensorData
    | MotionSensorData
    | VoltageSensorData
    | CustomSensorData;

export interface SensorPayload {
    api_key: string;
    json_data: SensorData[];
}

//helper
export type SensorDataTypeMap = {
    'temperature': TemperatureSensorData;
    'pressure': PressureSensorData;
    'motion': MotionSensorData;
    'voltage': VoltageSensorData;
    'custom': CustomSensorData;
}