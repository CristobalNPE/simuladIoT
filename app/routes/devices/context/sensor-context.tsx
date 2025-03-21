import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {SensorStatus} from '../schemas/sensor.schema';

export type SensorsMap = {
    [sensorId: string]: SensorStatus;
};

interface SensorContextType {
    sensors: SensorsMap;
    getSensorStatus: (sensorId: string) => SensorStatus;
    updateSensorStatus: (sensorId: string, status: Partial<SensorStatus>) => void;
    setSensorStatus: (sensorId: string, status: SensorStatus) => void;
}

const defaultSensorStatus: SensorStatus = {
    isVariable: false,
    isSending: false,
    intervalTime: 5000
};

const SensorContext = createContext<SensorContextType | undefined>(undefined);

interface SensorProviderProps {
    children: ReactNode;
    initialSensors?: SensorsMap;
}

export const SensorProvider: React.FC<SensorProviderProps> = ({
                                                                  children,
                                                                  initialSensors = {}
                                                              }) => {
    const [sensors, setSensors] = useState<SensorsMap>(initialSensors);

    const getSensorStatus = (sensorId: string): SensorStatus => {
        return sensors[sensorId] || {...defaultSensorStatus};
    };

    const updateSensorStatus = (sensorId: string, statusUpdate: Partial<SensorStatus>) => {
        setSensors(prevSensors => ({
            ...prevSensors,
            [sensorId]: {
                ...(prevSensors[sensorId] || defaultSensorStatus),
                ...statusUpdate
            }
        }));
    };

    const setSensorStatus = (sensorId: string, status: SensorStatus) => {
        setSensors(prevSensors => ({
            ...prevSensors,
            [sensorId]: status
        }));
    };

    return (
        <SensorContext.Provider value={{
            sensors,
            getSensorStatus,
            updateSensorStatus,
            setSensorStatus
        }}>
            {children}
        </SensorContext.Provider>
    );
};

export const useSensorContext = () => {
    const context = useContext(SensorContext);

    if (context === undefined) {
        throw new Error('useSensorContext must be used within a SensorProvider');
    }

    return context;
};

export const useSensor = (sensorId: string) => {
    const {getSensorStatus, updateSensorStatus, setSensorStatus} = useSensorContext();

    return {
        sensorStatus: getSensorStatus(sensorId),
        updateSensorStatus: (statusUpdate: Partial<SensorStatus>) =>
            updateSensorStatus(sensorId, statusUpdate),
        setSensorStatus: (status: SensorStatus) =>
            setSensorStatus(sensorId, status),
    };
};