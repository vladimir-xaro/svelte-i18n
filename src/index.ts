import { Readable, Writable, derived, readonly, writable } from 'svelte/store';
import isObject from 'isobject';
import deepmerge from 'deepmerge';
// import merge from 'merge';

export type Translation = {
    [K: string]: string|Translation;
};

export type InitOptions = {
    translations:           Record<string, Translation>;
    locale:                 string | null;
    defaultTranslations:    Record<string, string>;
}

export interface CurrentLocaleStore extends Writable<string|null> {
    setNullIf(this: void, locale: string|null): void;
}

const currentLocale: CurrentLocaleStore = (() => {
    const { set, subscribe } = writable<string|null>(null);
    let val: string|null = null;
    subscribe((_val) => {
        val = _val;
    });

    /**
     * @throws { Error } If locale not found
     */
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

    const _update = (cb: (locale: string|null) => string|null) => _set(cb(val));

    const setNullIf = (locale: string|null) => {
        if (val !== null && locale === val) {
            _set(locale);
        }
    }

    return {
        set:    _set,
        update: _update,
        subscribe,
        setNullIf,
    }
})();

export {
    currentLocale as locale
};

const _defaultTranslations: Writable<Record<string, string>> = writable<Record<string, string>>({});

const _allLocales: Writable<Set<string>> = writable<Set<string>>(new Set());
export const allLocales: Readable<Set<string>> = readonly(_allLocales);

const _allTranslations: Record<string, Translation> = {};
(<any>window).allTranslations = _allTranslations;

export const init = (options?: InitOptions) => {
    if (!options) {
        return;
    }

    if ('translations' in options) {
        if (!isObject(options.translations)) {
            throw new Error(`[@xaro/svelte-i18n] options.translations must be an object if passed`);
        }

        Object.assign(_allTranslations, options.translations);

        _allLocales.update(s => {
            for (const key in options.translations) {
                s.add(key);
            }
            return s;
        });
    }

    if ('defaultTranslations' in options) {
        if (! isObject(options.defaultTranslations)) {
            throw new Error(`[@xaro/svelte-i18n] options.defaultTranslations must be an object if passed`);
        }

        if (Object.keys(options.defaultTranslations).length) {
            _defaultTranslations.update(s => {
                Object.assign(s, options.defaultTranslations);
                return s;
            });
        }
    }

    if ('locale' in options) {
        if (typeof options.locale !== 'string') {
            throw new Error(`[@xaro/svelte-i18n] options.locale must be a string, ${typeof options.locale} passed`);
        }

        if (options.locale! in _allTranslations === false) {
            throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${options.locale}`);
        }

        currentLocale.set(options.locale);
    }
}

export const hasLocale = (locale: string) => locale in _allTranslations;

export const removeLocale = (locale: string) => {
    if (locale in _allTranslations) {
        delete _allTranslations[locale];

        currentLocale.setNullIf(locale);

        return true;
    }

    return false;
}

export const setTranslation = (
    locale:     string,
    path:       string|string[],
    value:      string|Translation,
    setLocale:  boolean = false
) => {
    if (locale in _allTranslations === false) {
        // throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
        _allTranslations[locale] = {};
        _allLocales.update(s => s.add(locale));
    }

    let arr: string[] = Array.isArray(path) ? path : path.split(/\.+/);

    if (!arr.length) {
        if (!isObject(value)) {
            throw new Error('[@xaro/svelte-i18n] Translation cannot be a string when no path is given');
        }

        _allTranslations[locale] = <Translation>value;

        return;
    }

    let obj = _allTranslations[locale];

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

    if (setLocale) {
        currentLocale.set(locale);
    }
}

export const addTranslation = (
    locale:     string,
    path:       string|string[],
    value:      string|Translation,
    setLocale:  boolean = false
) => {
    if (locale in _allTranslations === false) {
        // throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
        setTranslation(locale, path, value);
        return;
    }

    let arr: string[] = Array.isArray(path) ? path : path.split(/\.+/);

    if (!arr.length) {
        if (!isObject(value)) {
            throw new Error('[@xaro/svelte-i18n] Translation cannot be a string when no path is given');
        }

        _allTranslations[locale] = <Translation>value;

        return;
    }

    let obj = _allTranslations[locale];

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

    if (setLocale) {
        currentLocale.set(locale);
    }
}

export const removeTranslation = (
    locale:     string,
    path:       string|string[],
    setLocale:  boolean = false
) => {
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

    if (setLocale) {
        currentLocale.set(locale);
    }
}

const translate = (
    $locale:        string|null,
    path:           string|string[],
    params?:        Record<string, any>,
    defaultValue?:  string
) => {
    if ($locale === null) {
        return defaultValue || (Array.isArray(path) ? path.join(',') : path);
    }
    
    if ($locale in _allTranslations === false) {
        return defaultValue || (Array.isArray(path) ? path.join(',') : path);
    }
    
    let obj: Translation = _allTranslations[$locale];

    const withdraw = (key: string) => {
        if (typeof obj[key] === 'string') {
            let val = <string>obj[key];
            if (isObject(params)) {
                const keys = Object.keys(params!);
                if (keys.length) {
                    for (const key of keys) {
                        val = val.replaceAll(`{{${key}}}`, params![key]);
                    }
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
                return defaultValue || (Array.isArray(path) ? path.join(',') : path);
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
                return defaultValue || path;
            }
        }
    }

    return defaultValue || (Array.isArray(path) ? path.join(',') : path);
}

export const t = derived(
    currentLocale,
    ($locale) =>
        (path: string|string[], params: Record<string, any> = {}, defaultValue?: string) =>
            translate($locale, path, params, defaultValue)
);