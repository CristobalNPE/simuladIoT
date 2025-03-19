import Logo from "~/assets/simuladiot-logo.svg";
import LogoLight from "~/assets/simuladiot-logo-light.svg";
import React from "react";

export function AppLogo() {
    return (
        <div
            style={{
                "--logo-url": `url(${Logo})`,
                "--logo-url-light": `url(${LogoLight})`,
            } as React.CSSProperties}
            className={"shadow size-5 border p-5 rounded-lg bg-primary bg-[image:var(--logo-url-light)] dark:bg-[image:var(--logo-url)]  text-primary-foreground bg-cover bg-center "}>

        </div>
    )
}