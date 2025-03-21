import React, {useEffect, useState} from "react";

export function useDialogAutoClose(shouldClose: boolean): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
    const [open, setOpen] = useState(false);


    useEffect(() => {
        if (shouldClose) {
            setOpen(false);
        }
    }, [shouldClose]);

    return [open, setOpen];
}
