import { derived, writable } from 'svelte/store';

type Translation = {
    [K: string]: string|Translation;
};

const currentLocale = writable<string|null>(null);

const currentTrans = writable<Translation|null>(null);

const allTranslations: Record<string, Translation> = {};
(<any>window).allTranslations = allTranslations;

const init = (translations: Record<string, Translation> = {}, locale: string|null = null) => {
    Object.assign(allTranslations, translations);

    if (locale) {
        if (locale in allTranslations === false) {
            throw new Error(`No translations for locale: ${locale}`);
        }
        currentLocale.set(locale);
        currentTrans.set(allTranslations[locale]);
    }
}

const setTranslation = (locale: string, path: string|string[], value: string|Translation) => {
    let obj = allTranslations[locale];
    let prevObj = obj;

    if (Array.isArray(path)) {

    } else {
        const parts = path.split('.');
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
        }
        for (const part of parts) {
            prevObj = obj;
            if (part in obj === false) {
                obj[part] = {};
            }
            obj = <Translation>obj[part];
        }
        prevObj[parts.length - 1] = value;
    }
}

const translate = ($locale: string|null, path: string|string[], params: Record<string, any> = {}) => {
    if ($locale === null) {
        return Array.isArray(path) ? path.join(',') : path;
    }

    if ($locale in allTranslations === false) {
        throw new Error(`No translations for locale: ${$locale}`);
    }
    
    let obj: Translation = allTranslations[$locale];

    const withdraw = (key: string) => {
        if (typeof obj[key] === 'string') {
            let val = <string>obj[key];
            const keys = Object.keys(params);
            if (keys.length) {
                for (const key of keys) {
                    val = val.replaceAll(`{{${key}}}`, params[key]);
                }
            }
            return val;
        }

        obj = <Translation>obj[key];

        return null;
    }

    if (Array.isArray(path)) {
        loop:
        for (const item of path) {
            if (item in obj) {
                const val = withdraw(item);
                if (val !== null) {
                    return val;
                }
            } else {
                const parts = item.split('.');
                parts.splice(-1);
                while (parts.length) {
                    const _item = parts.join('.');
                    if (_item in obj) {
                        const val = withdraw(item);
                        if (val !== null) {
                            return val;
                        }
                        continue loop;
                    } else {
                        parts.splice(-1);
                    }
                }
                return Array.isArray(path) ? path.join(',') : path;
            }
        }
    } else {
        const parts = path.split('.');
        for (const part of parts) {
            if (part in obj) {
                const val = withdraw(part);
                if (val !== null) {
                    return val;
                }
            } else {
                return path;
            }
        }
    }

    return Array.isArray(path) ? path.join(',') : path;
}

const t = derived(
    currentLocale,
    ($locale) => (path: string|string[], params: Record<string, any> = {}) => translate($locale, path, params)
);

export {
    init,
    setTranslation,
    currentLocale as locale,
    t,
    // setLocale,
    // addLocale,
    // removeLocale,
    // addTranslation,
    // removeTranslation,
    // t,
};