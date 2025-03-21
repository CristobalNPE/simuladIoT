import {type FieldMetadata, unstable_useControl as useControl} from "@conform-to/react";
import React, {type ComponentProps, type ElementRef, useId, useRef} from "react";

import {Input} from "./ui/input";
import {Label} from "./ui/label";
import {Textarea} from "./ui/textarea";
import {cn} from "~/lib/utils";
import {HelpCircle} from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "~/components/ui/tooltip";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Switch} from "~/components/ui/switch";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export function ErrorList({
                              id,
                              errors,
                          }: {
    errors?: ListOfErrors;
    id?: string;
}) {
    const errorsToRender = errors?.filter(Boolean);
    if (!errorsToRender?.length) return null;
    return (
        <ul id={id} className="flex flex-col gap-1">
            {errorsToRender.map((e) => (
                <li key={e} className="text-[10px] text-red-600">
                    {e}
                </li>
            ))}
        </ul>
    );
}

export function SelectWrapper({
                                  errors,
                                  children,
                              }: {
    errors: ListOfErrors;
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                "w-full",
                errors?.length && "ring-2 ring-destructive rounded-md"
            )}
        >
            {children}
        </div>
    );
}

export function Field({
                          labelProps,
                          inputProps,
                          errors,
                          className,
                          help,
                      }: {
    labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
    inputProps: React.InputHTMLAttributes<HTMLInputElement>;
    errors?: ListOfErrors;
    className?: string;
    help?: string;
}) {

    const fallbackId = useId();
    const id = inputProps.id ?? fallbackId;
    const errorId = errors?.length ? `${id}-error` : undefined;
    const { key, ...restInputProps } = inputProps as { key?: React.Key } & React.InputHTMLAttributes<HTMLInputElement>;

    return (
        <div className={className}>

            <div className={"flex gap-2 items-center w-fit"}>
                <Label className={"shrink-0"} htmlFor={id} {...labelProps} />
                {help &&
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <HelpCircle size={14} className={"text-muted-foreground"}/>
                        </TooltipTrigger>
                        <TooltipContent>
                            {help}
                        </TooltipContent>
                    </Tooltip>
                }
            </div>

            <Input
                className={"mt-1"}
                id={id}
                key={key}
                aria-invalid={errorId ? true : undefined}
                aria-describedby={errorId}
                {...restInputProps}
            />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
                {errorId ? <ErrorList id={errorId} errors={errors}/> : null}
            </div>
        </div>
    );
}


export function TextareaField({
                                  labelProps,
                                  textareaProps,
                                  errors,
                                  className,
                              }: {
    labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
    textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    errors?: ListOfErrors;
    className?: string;
}) {
    const fallbackId = useId();
    const id = textareaProps.id ?? textareaProps.name ?? fallbackId;
    const errorId = errors?.length ? `${id}-error` : undefined;
    const { key, ...restTextAreaProps } = textareaProps as { key?: React.Key } & React.InputHTMLAttributes<HTMLTextAreaElement>;

    return (
        <div className={className}>
            <Label htmlFor={id} {...labelProps} />
            <Textarea
                className={"mt-1"}
                id={id}
                key={key}
                aria-invalid={errorId ? true : undefined}
                aria-describedby={errorId}
                {...restTextAreaProps}
            />
            <div className="min-h-[32px] px-4 pb-3 pt-1">
                {errorId ? <ErrorList id={errorId} errors={errors}/> : null}
            </div>
        </div>
    );
}


export const SelectField = ({
                                meta,
                                items,
                                placeholder,
    className,
                                ...props
                            }: {
    meta: FieldMetadata<string>;
    items: Array<{ name: string; value: string }>;
    placeholder: string;
    className?: string;
} & ComponentProps<typeof Select>) => {
    const selectRef = useRef<ElementRef<typeof SelectTrigger>>(null);
    const control = useControl(meta);

    return (
        <>
            <select
                name={meta.name}
                defaultValue={meta.initialValue ?? ''}
                className="sr-only"
                ref={control.register}
                aria-hidden
                tabIndex={-1}
                onFocus={() => {
                    selectRef.current?.focus();
                }}
            >
                <option value=""/>
                {items.map((option) => (
                    <option key={option.value} value={option.value}/>
                ))}
            </select>

            <Select
                {...props}

                value={control.value ?? ''}
                onValueChange={control.change}
                onOpenChange={(open) => {
                    if (!open) {
                        control.blur();
                    }
                }}
            >
                <SelectTrigger className={cn("w-full", className)}>
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => {
                        return (
                            <SelectItem key={item.value} value={item.value.toString()}>
                                {item.name}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </>
    );
};

export function SwitchConform({meta}: { meta: FieldMetadata<boolean> }) {
    const switchRef = useRef<ElementRef<typeof Switch>>(null);
    const control = useControl(meta);

    return (
        <>
            <input
                name={meta.name}
                ref={control.register}
                defaultValue={meta.initialValue}
                className="sr-only"
                tabIndex={-1}
                onFocus={() => {
                    switchRef.current?.focus();
                }}
            />
            <Switch
                ref={switchRef}
                checked={control.value === 'on'}
                onCheckedChange={(checked) => {
                    control.change(checked ? 'on' : '');
                }}
                onBlur={control.blur}
                className="focus:ring-stone-950 focus:ring-2 focus:ring-offset-2"
            ></Switch>
        </>
    );
}