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
                'required': '{{attr}} cannot be empty',
                'required.name': 'Enter your name' // Extended translation
            }
        }
    }, 'en');
</script>

{$t('rules.required', { attr: 'Attribute' }) /* "Attribute cannot be empty" will be displayed */}
{$t([ 'rules', 'required.name' ])            /* "Enter your name" will be displayed */}
{$t([ 'rules', 'required.etc' ])             /* "{{attr}} cannot be empty" will be displayed */}
{$t([ 'rules', 'smth' ])                     /* "rules.smth" will be displayed (non-existing path) */}
```


## Usage:
```svelte
<script lang="ts">
    import {
        type Translation,       // Type of locale translations
        type CurrentLocaleStore,// currentLocale store (Extended Writable with setNullIf method)
        currentLocale,          // Writable locale store (returns string or null)
        allLocales,             // Readonly all loaded locales (returns Set)
        init,                   // (Optionaly) Load initial translations and set currentLocale
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
                'required.name': 'Enter your name'
            },
        }
    }

    // Here we load the initial translation and set the locale
    init(langs, 'en');
    // === OR ===
    setTranslation('en', '', langs.en);
    $currentLocale = 'en'; // OR currentLocale.set('en')


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
{$t('caption.main')}

{$allLocales.join(', ') /* Get all locales (Only read) */}
```