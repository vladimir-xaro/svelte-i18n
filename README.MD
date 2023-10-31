# @xaro/svelte-i18n

Library for Svelte for easy localization of your application
- Dynamically add and remove translations
- Pass params to translation
- Availability of extended translation fields:

```svelte
<script>
    init({
        en: {
            rules: {
                'required':             '{{attr}} cannot be empty',
                'required.name':        'Enter your name',          // Extended translation
                'required.name.first':  'Enter your first name',    // Extended translation
            }
        }
    }, 'en');
</script>

{$t('rules.required', { attr: 'Attribute' }) /* "Attribute cannot be empty" will be displayed */}
{$t([ 'rules', 'required.name' ])            /* "Enter your name" will be displayed */}
{$t([ 'rules', 'required.etc' ])             /* "{{attr}} cannot be empty" will be displayed */}
{$t([ 'rules', 'required.name.first' ])      /* "Enter your first name" will be displayed */}
{$t([ 'rules', 'required.name.second' ])     /* "Enter your name" will be displayed (used [ 'rules', 'required.name' ] for non-existing path) */}
{$t([ 'rules', 'smth' ])                     /* "rules.smth" will be displayed (non-existing path) */}
{$t([ 'rules', 'smth' ], {}, 'no exists')    /* "no exists" will be displayed (non-existing path) */}
```


## Usage:
```svelte
<script lang="ts">
    import {
        type Translation,       // Type of locale translations
        type InitOptions,       // Type of init method options argument type
        type CurrentLocaleStore,// currentLocale store (Extended Writable with setNullIf method)
        currentLocale,          // Writable locale store (returns string or null)
        allLocales,             // Readonly all loaded locales (Readonly< Set<string> >)
        init,                   // (Optionaly)
                                // - Load initial translations
                                // - Set currentLocale
                                // - Set defaultTranslation for non-existing paths
        hasLocale,              // Checks existing locale (returns boolean)
        removeLocale,           // Removes the locale and its translations
        addTranslation,         // Adds translation to path (Replace EXISTING translations in path)
        setTranslation,         // Sets translation to path (Replace ALL translations in path)
        removeTranslation,      // Remove locale's translation by path
        t                       // Main derived store to show translation
    } from '@xaro/svelte-i18n';

    const langs = {
        en: {
            caption: 'Hello',
            rules: {
                'required': '{{attr}} cannot be empty',
                /**
                 * Extended fields works only when path given in array!!!
                 * @example {$t([ 'rules', 'required.name' ])}
                 * @example {$t([ 'rules', 'required.name.first' ])}
                 */
                'required.name': 'Enter your name',
                'required.name.first': 'Enter your first name',
            },
            // Also valid:
            'rules.2': {
                /**
                 * works:
                 * @example {$t([ 'rules.2', 'required' ])}
                 * 
                 * @example {$t([ 'rules.2', 'required.name' ])}
                 */
                required: 'Attribute required'
            }
        }
    }

    // Here we load the initial translation
    // Set the locale
    // Set default translate for non-existing translation paths
    init({
        translations: langs,
        defaultTranslations: {
            en: 'No translation found'
        },
        locale: 'en',
    });
    // === OR ===
    setTranslation('en', '', langs.en);
    $currentLocale = 'en'; // OR currentLocale.set('en')
    // default translation can set in init function OR pass defaultValue to $t as 3rd parameter


    // Here we are adding translation to an existing locale:
    addTranslation('en', 'rules.unique', '{{attr}} must be unique');
    // Here we add extended translation (for email field in this case):
    addTranslation('en', [ 'rules', 'unique.email' ], 'A user with this email already exists');
    // We can only access the extended translation fields by passing the path in the array,
    // where the extended fields must be in one array element, in this case it is "apple"
    
    // Now the locale "en" has the value:
    // {
    //     caption: 'Hello',
    //     rules: {
    //         'required': '{{attr}} cannot be empty',
    //         'required.name': 'Enter your name',
    //         'unique': '{{attr}} must be unique',
    //         'unique.email': 'A user with this email already exists',
    //     },
    // }


    // We can also add the entire translation object:
    addTranslation('en', [ 'rules' ], {
        'min': 'The {{attr}} must be at least {{num}} characters long',
        'min.name': 'The name cannot be shorter than 5 characters'
    });
    // Now the locale "en" has the value:
    // {
    //     caption: 'Hello',
    //     rules: {
    //         'required': '{{attr}} cannot be empty',
    //         'required.name': 'Enter your name',
    //         'unique': '{{attr}} must be unique',
    //         'unique.email': 'A user with this email already exists',
    //         'min': 'The {{attr}} must be at least {{num}} characters long',
    //         'min.name': 'The name cannot be shorter than 5 characters'
    //     },
    // }


    // We can also clear the translation by specifying the required path and empty object as value:
    setTranslation('en', 'rules', {});
    // Now the locale "en" has the value:
    // {
    //     caption: 'Hello',
    // }
    // Inside code used `delete translations[locale][...path...]`


    // To add a new locale call "setTranslation" or "addTranslation" with the required locale and
    // empty string or array as path
    setTranslation('ua', [], {
        caption: 'Привіт',
    });
    // New locale "ua" has the value:
    // {
    //     caption: 'Привіт',
    // }

    // Removes a locale along with its translation
    removeLocale('ua');
</script>

{$t('caption') /* "Hello" will be displayed */}

<!-- "Hello 1" will be displayed here -->
{$t('rules.required') /* "{{attr}} cannot be empty" will be displayed */}
{$t('rules.required', { attr: 'Name' }) /* "Name cannot be empty" will be displayed */}
{$t([ 'rules', 'required.name' ]) /* "Enter your name" will be displayed. Extended fields works only when path given in array!!! */}
{$t([ 'rules', 'required.name.first' ]) /* "Enter your first name" will be displayed */}
{$t([ 'rules', 'required.name.second' ]) /* "Enter your name" will be displayed (used [ 'rules', 'required.name' ], because 'required.name.second' does not exist) */}
{$t([ 'rules', 'required.name.second' ], {}, 'default value will not be displayed') /* "Enter your name" will be displayed. Default value works only for general non-existing properties, not extended */}
{$t([ 'rules', 'required.email' ]) /* "{{attr}} cannot be empty" will be displayed from `fields.required` */}
{$t([ 'rules', 'required.email' ], {}, 'No translation') /* "No Translation" will be displayed */}

{Array.from($allLocales).join(', ') /* Get all locales (Readonly< Set<string> >) */}
```