export type DeviceType = "esp32" | "zigbee";

export type DeviceInfo = {
    deviceType: DeviceType,
    deviceName: string,
    deviceId: string,
    message: string,
    status?: number
}

export type DeviceInfoWithTimestamp = DeviceInfo & {
    timestamp: Date
}