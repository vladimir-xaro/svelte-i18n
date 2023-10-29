import { derived, readonly, writable } from "svelte/store";
import isObject from "isobject";
import deepmerge from "deepmerge";
const currentLocale = (() => {
  const { set, subscribe } = writable(null);
  let val = null;
  subscribe((_val) => {
    val = _val;
  });
  const _set = (locale) => {
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
  };
  const _update = (cb) => _set(cb());
  return {
    set: _set,
    update: _update,
    subscribe
  };
})();
const _allLocales = writable(/* @__PURE__ */ new Set());
const allLocales = readonly(_allLocales);
const _allTranslations = {};
window.allTranslations = _allTranslations;
const init = (translations = {}, locale = null) => {
  if (!isObject(translations)) {
    throw new Error(`[@xaro/svelte-i18n] Translations must be an object`);
  }
  Object.assign(_allTranslations, translations);
  _allLocales.update((s) => {
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
};
const hasLocale = (locale) => locale in _allTranslations;
const setTranslation = (locale, path, value) => {
  if (locale in _allTranslations === false) {
    _allTranslations[locale] = {};
    _allLocales.update((s) => s.add(locale));
  }
  let obj = _allTranslations[locale];
  let arr = Array.isArray(path) ? path : path.split(/\.+/);
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    if (!key) {
      throw new Error("[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character");
    } else if (i === arr.length - 1) {
      obj[key] = value;
    } else {
      if (key in obj === false) {
        obj[key] = {};
      }
      obj = obj[key];
    }
  }
};
const addTranslation = (locale, path, value) => {
  if (locale in _allTranslations === false) {
    setTranslation(locale, path, value);
    return;
  }
  let obj = _allTranslations[locale];
  let arr = Array.isArray(path) ? path : path.split(/\.+/);
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    if (!key) {
      throw new Error("[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character");
    } else if (i === arr.length - 1) {
      if (key in obj && isObject(obj[key]) && isObject(value)) {
        obj[key] = deepmerge(obj[key], value);
      } else {
        obj[key] = value;
      }
    } else {
      if (key in obj === false) {
        obj[key] = {};
      }
      obj = obj[key];
    }
  }
};
const removeTranslation = (locale, path) => {
  if (locale in _allTranslations === false) {
    throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${locale}`);
  }
  let obj = _allTranslations[locale];
  let arr = Array.isArray(path) ? path : path.split(/\.+/);
  for (let i = 0; i < arr.length; i++) {
    const key = arr[i];
    if (!key) {
      throw new Error("[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character");
    } else if (i === arr.length - 1) {
      delete obj[key];
    } else {
      if (key in obj === false) {
        obj[key] = {};
      }
      obj = obj[key];
    }
  }
};
const translate = ($locale, path, params = {}) => {
  if ($locale === null) {
    return Array.isArray(path) ? path.join(",") : path;
  }
  if ($locale in _allTranslations === false) {
    throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${$locale}`);
  }
  let obj = _allTranslations[$locale];
  const withdraw = (key) => {
    if (typeof obj[key] === "string") {
      let val = obj[key];
      const keys = Object.keys(params);
      if (keys.length) {
        for (const key2 of keys) {
          val = val.replaceAll(`{{${key2}}}`, params[key2]);
        }
      }
      return val;
    }
    obj = obj[key];
    return null;
  };
  if (Array.isArray(path)) {
    loop:
      for (const item of path) {
        if (item in obj) {
          const val = withdraw(item);
          if (val !== null) {
            return val;
          }
        } else {
          const parts = item.split(".");
          parts.splice(-1);
          while (parts.length) {
            const _item = parts.join(".");
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
          return Array.isArray(path) ? path.join(",") : path;
        }
      }
  } else {
    const parts = path.split(".");
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
  return Array.isArray(path) ? path.join(",") : path;
};
const t = derived(
  currentLocale,
  ($locale) => (path, params = {}) => translate($locale, path, params)
);
export {
  addTranslation,
  allLocales,
  hasLocale,
  init,
  currentLocale as locale,
  removeTranslation,
  setTranslation,
  t
};
//# sourceMappingURL=svelte-i18n.mjs.map
