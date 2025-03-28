import React, {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {SensorStatus} from '../schemas/sensor.schema';
import {autoSendManager} from '../services/auto-send.manager';

export type SensorsMap = {
    [sensorId: string]: SensorStatus;
};

interface SensorContextType {
    getSensorStatus: (sensorId: string) => SensorStatus;
    updateSensorStatus: (sensorId: string, status: Partial<SensorStatus>) => void;
}

const defaultSensorStatus: SensorStatus = {
    isVariable: false,
    isSending: false,
    intervalTime: 5000,
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

    useEffect(() => {
        console.log("[SensorProvider] Starting status poll effect.");
        const intervalId = setInterval(() => {
            const trackedSensorIds = Object.keys(sensors);
            if (trackedSensorIds.length === 0) return;

            let changed = false;
            const nextSensors = {...sensors};

            trackedSensorIds.forEach(sensorId => {
                const currentProviderStatus = sensors[sensorId];
                const currentManagerStatus = autoSendManager.getAutoSendStatus(sensorId);

                if (currentProviderStatus.isSending !== currentManagerStatus.enabled) {
                    console.log(`[SensorProvider] Status change detected for ${sensorId}: isSending ${currentProviderStatus.isSending} -> ${currentManagerStatus.enabled}`);
                    nextSensors[sensorId] = {
                        ...currentProviderStatus,
                        isSending: currentManagerStatus.enabled,
                    };
                    changed = true;
                }
            });

            if (changed) {
                console.log("[SensorProvider] Updating state due to status changes.");
                setSensors(nextSensors);
            }
        }, 1500);

        return () => {
            console.log("[SensorProvider] Stopping status poll effect.");
            clearInterval(intervalId);
        };
    }, [sensors]);

    const getSensorStatus = useCallback((sensorId: string): SensorStatus => {
        return sensors[sensorId] || {...defaultSensorStatus};
    }, [sensors]);

    const updateSensorStatus = useCallback((sensorId: string, statusUpdate: Partial<SensorStatus>) => {
        setSensors(prevSensors => {
            const currentStatus = prevSensors[sensorId] || defaultSensorStatus;
            const nextStatus = {
                ...currentStatus,
                ...statusUpdate,
                isSending: currentStatus.isSending
            };

            if (JSON.stringify(currentStatus) === JSON.stringify(nextStatus)) {
                return prevSensors; // No change
            }
            return {
                ...prevSensors,
                [sensorId]: nextStatus
            };
        });
    }, []);

    const contextValue = useMemo(() => ({
        getSensorStatus,
        updateSensorStatus,
    }), [getSensorStatus, updateSensorStatus]);

    return (
        <SensorContext.Provider value={contextValue}>
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
    const {getSensorStatus, updateSensorStatus} = useSensorContext();

    const sensorStatus = getSensorStatus(sensorId);

    const updateStatus = useCallback((statusUpdate: Partial<SensorStatus>) => {
        updateSensorStatus(sensorId, statusUpdate);
    }, [updateSensorStatus, sensorId]);

    return {
        sensorStatus,
        updateSensorStatus: updateStatus,
    };
};