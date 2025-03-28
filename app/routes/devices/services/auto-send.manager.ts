import type {DataSentResult} from "~/routes/devices/services/message-sending.server";

interface AutoSendConfig {
    intervalId: NodeJS.Timeout;
    intervalMs: number;
    lastSentAt: number;
    isSending: boolean;
}

export type AutoSendStatus = {
    enabled: boolean;
    intervalMs?: number;
    lastSentAt?: number;
    isSending?: boolean;
}

const autoSendConfigs: Record<string, AutoSendConfig> = {};

// helper to call server action
async function triggerAutoSendOnServer(sensorId: string, useRealisticValues: boolean): Promise<DataSentResult> {
    console.log(`[AutoSend Client] Triggering send for ${sensorId}...`);

    try {
        const response = await fetch(`/api/trigger-auto-send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sensorId,
                useRealisticValues
            })
        });

        const result: DataSentResult = await response.json();

        if (!response.ok || !result.success) {
            console.error(`[AutoSend Client] Failed to trigger send for ${sensorId}:`, result.message || `HTTP ${response.status}`);
            return {success: false, message: result.message || `HTTP ${response.status}`, error: result.error};
        }

        console.log(`[AutoSend Client] Successfully triggered send for ${sensorId}:`, result.message);
        return result; // success: true

    } catch (error) {
        console.error(`[AutoSend Client] Network error triggering send for ${sensorId}:`, error);
        return {
            success: false,
            message: "Network error during trigger",
            error: error instanceof Error ? error.message : "Unknown network error"
        };
    }
}

export const autoSendManager = {
    startAutoSend(
        sensorId: string,
        intervalMs: number = 5000,
        useRealisticValues: boolean = false
    ): void {
        if (autoSendConfigs[sensorId]) {
            console.log(`[AutoSend Client] Auto-send already running for ${sensorId}. Stopping old one.`);
            this.stopAutoSend(sensorId);
        }
        console.log(`[AutoSend Client] Starting auto-send for ${sensorId} every ${intervalMs}ms.`);


        const config: AutoSendConfig = {
            intervalId: setInterval(async () => {
                const currentConfig = autoSendConfigs[sensorId];

                if (!currentConfig || currentConfig.isSending) {
                    console.warn(`[AutoSend Client] Skipping trigger for ${sensorId}, previous one still active or config missing.`);
                    return;
                }

                currentConfig.isSending = true;

                const result = await triggerAutoSendOnServer(sensorId, useRealisticValues);

                if (result.success && autoSendConfigs[sensorId]) { // Check config still exists
                    autoSendConfigs[sensorId].lastSentAt = Date.now();
                } else if (!result.success) {
                    // Optional: Stop auto-send on failure?
                    console.error(`[AutoSend Client] Send failed for ${sensorId}, stopping auto-send.`);
                    this.stopAutoSend(sensorId);
                }

                // mark as finished sending (regardless of success/fail, unless stopped)
                if (autoSendConfigs[sensorId]) {
                    autoSendConfigs[sensorId].isSending = false;
                }
            }, intervalMs),
            intervalMs,
            lastSentAt: 0,
            isSending: false,
        };

        autoSendConfigs[sensorId] = config;
        // immediately trigger the first send // todo: should we do this?
        triggerAutoSendOnServer(sensorId, useRealisticValues).then(result => {
        });
    },

    stopAutoSend(sensorId: string): boolean {
        const config = autoSendConfigs[sensorId];

        if (!config) {
            return false;
        }

        console.log(`[AutoSend Client] Stopping auto-send for ${sensorId}.`);
        clearInterval(config.intervalId);
        delete autoSendConfigs[sensorId];
        return true;
    },

    isAutoSendEnabled(sensorId: string): boolean {
        return !!autoSendConfigs[sensorId];
    },

    getAutoSendStatus(sensorId: string): AutoSendStatus {
        const config = autoSendConfigs[sensorId];

        if (!config) {
            return {enabled: false};
        }
        return {
            enabled: true,
            intervalMs: config.intervalMs,
            lastSentAt: config.lastSentAt > 0 ? config.lastSentAt : undefined,
            isSending: config.isSending
        };
    },
    stopAllAutoSend(): void {
        console.log("[AutoSend Client] Stopping all auto-send intervals.");
        Object.keys(autoSendConfigs).forEach(sensorId => {
            this.stopAutoSend(sensorId);
        });
    },
}