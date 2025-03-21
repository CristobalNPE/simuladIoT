import {useEffect} from "react";
import {toast} from "sonner";
import type {FetcherWithComponents} from "react-router";

interface FetcherData {
    result?: {
        status?: string;
    };
}

export function useFetcherSuccessToast<T extends FetcherData>(
    fetcher: FetcherWithComponents<T>,
    successMessage: string

) {
    useEffect(() => {
        if (fetcher.state === "idle" && fetcher.data?.result?.status === "success") {
            toast.success(successMessage);
        }
    }, [fetcher.state, fetcher.data]);
}