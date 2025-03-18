import {useEffect, useState} from "react"
import {generateSamplePayload, SAMPLE_API_KEY} from "~/utils/payload.utils";

export function useDeviceState(deviceId: string, deviceType: string) {
    // Initial device name based on type and ID
    const generateDeviceName = () => {
        return `Sensor ${deviceType === "esp32" ? "ESP32" : "Zigbee"}-[${deviceId.split("-")[1].slice(-4)}]`
    }

    // TODO: remove this
    // const generateApiKey = () => {
    //     return `sensor_${Math.random().toString(36).substring(2, 10)}`
    // }
    const generateApiKey = () => {
        return SAMPLE_API_KEY
    }

    // State management only - no business logic
    const [deviceName, setDeviceName] = useState(generateDeviceName())
    const [sensorApiKey, setSensorApiKey] = useState(generateApiKey())
    const [sendInterval, setSendInterval] = useState<number | null>(null)
    const [intervalTime, setIntervalTime] = useState(5)
    const [sensorCategory, setSensorCategory] = useState("temperature")
    const [isSending, setIsSending] = useState(false)

    // Generate initial payload
    const initialPayload = generateSamplePayload(sensorCategory, sensorApiKey)
    const [customPayload, setCustomPayload] = useState(JSON.stringify(initialPayload, null, 2))

    // Clean up interval on unmount
    useEffect(() => {
        return () => {
            if (sendInterval) {
                clearInterval(sendInterval)
            }
        }
    }, [sendInterval])

    return {
        deviceName,
        setDeviceName,
        sensorApiKey,
        setSensorApiKey,
        sensorCategory,
        setSensorCategory,
        customPayload,
        setCustomPayload,
        intervalTime,
        setIntervalTime,
        isSending,
        setIsSending,
        sendInterval,
        setSendInterval
    }
}