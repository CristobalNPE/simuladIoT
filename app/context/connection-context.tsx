import React, {createContext, type ReactNode, useContext, useState} from 'react';
import type {ConnectionConfig, MqttConnection, RestConnection} from '~/types/connection.types';

interface ConnectionContextType {
    connectionConfig: ConnectionConfig;
    updateRestConnection: (data: Partial<Omit<RestConnection, 'connectionType'>>) => void;
    updateMqttConnection: (data: Partial<Omit<MqttConnection, 'connectionType'>>) => void;
    setConnectionType: (type: 'rest' | 'mqtt') => void;
    connectionType: 'rest' | 'mqtt';
    getRestEndpoint: () => string;
    getMqttEndpoint: () => string;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({children}) => {

    //TODO: Remove defaults
    const [domain, setDomain] = useState('localhost');
    const [port, setPort] = useState(8080);
    const [endpoint, setEndpoint] = useState('/api/v1/sensor_data');

    const [broker, setBroker] = useState('localhost');
    const [mqttPort, setMqttPort] = useState(1883);
    const [topic, setTopic] = useState('iot/sensors');

    const [connectionType, setConnectionType] = useState<'rest' | 'mqtt'>('rest');

    const connectionConfig: ConnectionConfig = connectionType === 'rest'
        ? {connectionType: 'rest', domain, port, endpoint}
        : {connectionType: 'mqtt', broker, port: mqttPort, topic};

    const updateRestConnection = (data: Partial<Omit<RestConnection, 'connectionType'>>) => {
        if (data.domain !== undefined) setDomain(data.domain);
        if (data.port !== undefined) setPort(data.port);
        if (data.endpoint !== undefined) setEndpoint(data.endpoint);
    };

    const updateMqttConnection = (data: Partial<Omit<MqttConnection, 'connectionType'>>) => {
        if (data.broker !== undefined) setBroker(data.broker);
        if (data.port !== undefined) setMqttPort(data.port);
        if (data.topic !== undefined) setTopic(data.topic);
    };

    const getRestEndpoint = (): string => {
        if (!domain || !port || !endpoint) return "";

        const isLocalDomain = domain === 'localhost' || domain === '127.0.0.1';
        return `${isLocalDomain ? 'http' : 'https'}://${domain}:${port}${endpoint}`;
    };

    const getMqttEndpoint = (): string => {
        if (!broker || !mqttPort || !topic) return "";

        return `mqtt://${broker}:${mqttPort}/${topic}`;
    };

    return (
        <ConnectionContext.Provider
            value={{
                connectionConfig,
                updateRestConnection,
                updateMqttConnection,
                setConnectionType,
                connectionType,
                getRestEndpoint,
                getMqttEndpoint
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (context === undefined) {
        throw new Error('useConnection must be used within a ConnectionProvider');
    }
    return context;
};