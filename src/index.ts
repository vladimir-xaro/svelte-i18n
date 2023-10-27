import { derived, readable, readonly, writable } from 'svelte/store';
import isObject from 'isobject';
import deepmerge from 'deepmerge';
// import merge from 'merge';

export type Translation = {
    [K: string]: string|Translation;
};

const currentLocale = (() => {
    const { set, subscribe } = writable<string|null>(null);
    let val: string|null = null;
    subscribe((_val) => {
        val = _val;
    });

    const _set = (locale: string|null) => {
        if (locale === val) {
            return;
        }

        if (locale === null) {
            set(null);
            return;
        }

        if (locale in _allTranslations === false) {
            throw new Error(`[@xaro/svelte-i18n] No translations for locale: "${locale}"`);
        }

        set(locale);
    }

    const _update = (cb: () => string|null) => _set(cb());

    return {
        set:    _set,
        update: _update,
        subscribe,
    }
})();

export {
    currentLocale as locale
};

const _allLocales = writable<Set<string>>(new Set());
export const allLocales = readonly(_allLocales);

const _allTranslations: Record<string, Translation> = {};
(<any>window).allTranslations = _allTranslations;

export const init = (translations: Record<string, Translation> = {}, locale: string|null = null) => {
    if (! isObject(translations)) {
        throw new Error(`[@xaro/svelte-i18n] Translations must be an object`);
    }

    Object.assign(_allTranslations, translations);

    _allLocales.update(s => {
        for (const key in translations) {
            s.add(key);
        }
        return s;
    });

    if (locale) {
        if (locale in _allTranslations === false) {
            throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
        }
    }

    currentLocale.set(locale);
}

export const hasLocale = (locale: string) => locale in _allTranslations;

export const setTranslation = (locale: string, path: string|string[], value: string|Translation) => {
    if (locale in _allTranslations === false) {
        // throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
        _allTranslations[locale] = {};
        _allLocales.update(s => s.add(locale));
    }

    let obj = _allTranslations[locale];

    let arr: string[] = Array.isArray(path) ? path : path.split(/\.+/);

    for (let i = 0; i < arr.length; i++) {
        const key = arr[i];
        if (!key) {
            throw new Error('[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character');
        } else if (i === arr.length - 1) {
            obj[key] = value;
        } else {
            if (key in obj === false) {
                obj[key] = {};
            }
            obj = <Translation>obj[key];
        }
    }
}

export const addTranslation = (locale: string, path: string|string[], value: string|Translation) => {
    if (locale in _allTranslations === false) {
        // throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
        setTranslation(locale, path, value);
        return;
    }

    let obj = _allTranslations[locale];

    let arr: string[] = Array.isArray(path) ? path : path.split(/\.+/);

    for (let i = 0; i < arr.length; i++) {
        const key = arr[i];
        if (!key) {
            throw new Error('[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character');
        } else if (i === arr.length - 1) {
            if (key in obj && isObject(obj[key]) && isObject(value)) {
                obj[key] = deepmerge(<Translation>obj[key], <Translation>value);
            } else {
                obj[key] = value;
            }
        } else {
            if (key in obj === false) {
                obj[key] = {};
            }
            obj = <Translation>obj[key];
        }
    }
}

export const removeTranslation = (locale: string, path: string|string[]) => {
    if (locale in _allTranslations === false) {
        throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
    }

    let obj = _allTranslations[locale];

    let arr: string[] = Array.isArray(path) ? path : path.split(/\.+/);

    for (let i = 0; i < arr.length; i++) {
        const key = arr[i];
        if (!key) {
            throw new Error('[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character');
        } else if (i === arr.length - 1) {
            delete obj[key];
        } else {
            if (key in obj === false) {
                obj[key] = {};
            }
            obj = <Translation>obj[key];
        }
    }
}

const translate = ($locale: string|null, path: string|string[], params: Record<string, any> = {}) => {
    if ($locale === null) {
        return Array.isArray(path) ? path.join(',') : path;
    }

    if ($locale in _allTranslations === false) {
        throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${$locale}`);
    }
    
    let obj: Translation = _allTranslations[$locale];

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

export const t = derived(
    currentLocale,
    ($locale) =>
        (path: string|string[], params: Record<string, any> = {}) =>
            translate($locale, path, params)
);