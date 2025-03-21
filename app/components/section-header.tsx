import React from "react";

export function SectionHeader({title, description}: { title: string, description: string }) {
    return (
        <header>
            <h1 className={"text-xl font-bold"}>{title}</h1>
            <h4 className={"text-sm text-muted-foreground"}>{description}</h4>
        </header>
    )
}