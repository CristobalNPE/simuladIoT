import {Theme, useTheme} from "remix-themes";
import {Moon, Sun} from "lucide-react";
import {cn} from "~/lib/utils";

export function ThemeSwitch({className}: { className?: string }) {
    const [theme, setTheme] = useTheme();

    return (
        <button
            type="button"
            className={cn("cursor-pointer relative flex h-8 w-24 items-center justify-center rounded-full border", className)}
            onClick={() => setTheme(prev => prev === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
            <div className="relative h-5 w-5 ">
                <Sun
                    size={20}
                    className={`absolute left-0 top-0 transition-all duration-300 
            ${theme === 'light'
                        ? 'rotate-0 scale-100 opacity-100'
                        : '-rotate-90 scale-0 opacity-0'
                    } hover:scale-105 hover:rotate-12`}
                />
                <Moon
                    size={20}
                    className={`absolute left-0 top-0 transition-all duration-300
            ${theme === 'dark'
                        ? 'rotate-0 scale-100 opacity-100'
                        : 'rotate-90 scale-0 opacity-0'
                    } hover:scale-105 hover:rotate-12`}
                />
            </div>
        </button>
    );
}

