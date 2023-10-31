import { Writable } from 'svelte/store';

type Translation = {
    [K: string]: string | Translation;
};

type InitOptions = {
    translations?:          Record<string, Translation>;
    locale?:                string | null;
    defaultTranslations?:   Record<string, string>;
}

interface CurrentLocaleStore extends Writable<string | null> {
    /**
     * Sets locale to null if:
     * - current locale is not null
     * - passed locale is not null
     * - current locale === passed locale
     * 
     * Returns success status
     */
    setNullIf(this: void, locale: string | null): boolean;
}

/**
 * Writable current locale store
 * 
 * Use it for change language for existing locales
 * 
 * To add new locales, use:
 * 
 * - `init` method (`Warning: See method description`)
 * - `addTranslation`
 * - `setTranslation`
 */
declare const currentLocale: import('svelte/store').Writable<string|null>;

/**
 * Readable all locales store
 */
declare const allLocales: import('svelte/store').Readable<string[]>;

/**
 * Initializes the locale. You can pass translations and the original locale if one was passed in
 * 
 * `Warning!!!`
 * 
 * `If you call the function again, the passed translations can replace the existing ones, since here they are combined by the "Object.assign" method`
 */
declare const init: (options?: InitOptions) => void;

/**
 * Checks locale code exists
 */
declare const hasLocale: (locale: string) => boolean;

/**
 * Removes the locale and its translations
 * @returns { boolean } Result of deletion
 */
declare const removeLocale: (locale: string) => boolean;

/**
 * Adds translation to path (Replace existing translations)
 * 
 * @example
 * // For example initial locale translation:
 * { fields: { unique: 'This field must be unique' } }
 * addTranslation('en', 'fields', { required: 'This field cannot be empty' })
 * // Locale translations will:
 * { fields: { required: 'This field cannot be empty', unique: 'This field must be unique' } }
 * 
 * @param { string } locale
 * @param { string | string[] } path
 * @param { string | Translation } value
 * @param { boolean } [setLocale=false] // Set locale after add translation (default: false)
 */
declare const addTranslation: (locale: string, path: string | string[], value: string | Translation, setLocale?: boolean) => void;

/**
 * Sets translation to path (Replace ALL translations in path)
 * 
 * @example
 * // For example initial locale translation:
 * { fields: { unique: 'This field must be unique' } }
 * setTranslation('en', 'fields', { required: 'This field cannot be empty' })
 * // Locale translations will:
 * { fields: { required: 'This field cannot be empty' } }
 * 
 * @param { string } locale
 * @param { string | string[] } path
 * @param { string | Translation } value
 * @param { boolean } [setLocale=false] // Set locale after set translation (default: false)
 */
declare const setTranslation: (locale: string, path: string | string[], value: string | Translation, setLocale?: boolean) => void;

/**
 * Remove locale's translation by path
 * @example
 * // For example initial locale translation:
 * { fields: { required: 'This field cannot be empty', unique: 'This field must be unique' } }
 * removeTranslation('en', 'fields.unique');
 * // Translation will:
 * { fields: { required: 'This field cannot be empty' } }
 * @summary Also removes inside paths
 * 
 * @param { string } locale
 * @param { string | string[] } path
 * @param { boolean } [setLocale=false] // Set locale after remove translation (default: false)
 */
declare const removeTranslation: (locale: string, path: string | string[], setLocale?: boolean) => void;

/**
 * Main translate derived store
 * @example $t('fields.requred')
 * @example $t('fields.requred', { attr: 'name' }, 'Default translation if locale or translation not found')
 * @example $t([ 'fields', 'requred' ], { attr: 'name' })
 * @example $t([ 'fields', 'requred.name' ]) // if "required.name" not exists - will use "required"
 */
declare const t: import('svelte/store').Readable<(path: string | string[], params?: Record<string, any>, defaultValue?: string) => string>;

export {
    type Translation,
    type InitOptions,
    type CurrentLocaleStore,
    currentLocale as locale,
    allLocales,
    init,
    hasLocale,
    removeLocale,
    setTranslation,
    addTranslation,
    removeTranslation,
    t,
};
