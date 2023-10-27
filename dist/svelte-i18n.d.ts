type Translation = {
    [K: string]: string | Translation;
};

/**
 * Writable current locale store
 * 
 * Use it for change language for existing locales
 * 
 * To add new locales, use:
 * 
 * - `init` method (`Warning: See method description`)
 * 
 * - `addTranslation`
 * 
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
declare const init: (translations?: Record<string, Translation>, locale?: string | null) => void;

/**
 * Checks locale code exists
 */
declare const hasLocale: (locale: string) => boolean;

/**
 * Adds translation to path (Replace existing translations)
 * 
 * @example
 * // For example initial locale translation:
 * { fields: { unique: 'This field must be unique' } }
 * addTranslation('en', 'fields', { required: 'This field cannot be empty' })
 * // Locale translations will:
 * { fields: { required: 'This field cannot be empty', unique: 'This field must be unique' } }
*/
declare const addTranslation: (locale: string, path: string | string[], value: string | Translation) => void;

/**
 * Sets translation to path (Replace ALL translations in path)
 * 
 * @example
 * // For example initial locale translation:
 * { fields: { unique: 'This field must be unique' } }
 * setTranslation('en', 'fields', { required: 'This field cannot be empty' })
 * // Locale translations will:
 * { fields: { required: 'This field cannot be empty' } }
*/
declare const setTranslation: (locale: string, path: string | string[], value: string | Translation) => void;

/**
 * Remove locale's translation by path
 * @summary Also removes inside paths
 */
declare const removeTranslation: (locale: string, path: string | string[]) => void;

/**
 * Main translate derived store
 * @example $t('fields.requred')
 * @example $t('fields.requred', { attr: 'name' })
 * @example $t([ 'fields', 'requred' ])
 * @example $t([ 'fields', 'requred.name' ]) // if "required.name" not exists - will use "required"
 */
declare const t: import('svelte/store').Readable<string>;

export {
    currentLocale as locale,
    allLocales,
    init,
    hasLocale,
    setTranslation,
    addTranslation,
    removeTranslation,
    t,
};
