import type {SubmissionResult} from "@conform-to/react";

export function isSubmissionResult(data: any): data is SubmissionResult<any> {
    return data != null && typeof data === 'object' && ('status' in data || 'error' in data || 'value' in data || 'intent' in data);
}
