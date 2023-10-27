type Translation = {
    [K: string]: string | Translation;
};
declare const currentLocale: import('svelte/store').Writable<string|null>;
declare const init: (translations?: Record<string, Translation>, locale?: string | null) => void;
declare const setTranslation: (locale: string, path: string | string[], value: string | Translation) => void;
declare const t: import('svelte/store').Readable<string>;
export { init, setTranslation, currentLocale as locale, t, };
