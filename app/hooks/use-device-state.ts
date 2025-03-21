import {useEffect, useState} from "react"
import {generateSamplePayload, SAMPLE_API_KEY} from "~/utils/payload.utils";
import type {SensorCategory} from "~/types/sensor.types";

export function useDeviceState() {

    const [sendInterval, setSendInterval] = useState<number | null>(null)
    const [intervalTime, setIntervalTime] = useState(5)
    const [isSending, setIsSending] = useState(false)
    const [useRealisticValues, setUseRealisticValues] = useState(false);

    // clean up interval on unmount
    useEffect(() => {
        return () => {
            if (sendInterval) {
                clearInterval(sendInterval)
            }
        }
    }, [sendInterval])

    return {
        intervalTime,
        setIntervalTime,
        isSending,
        setIsSending,
        sendInterval,
        setSendInterval,
        useRealisticValues,
        setUseRealisticValues
    }
}