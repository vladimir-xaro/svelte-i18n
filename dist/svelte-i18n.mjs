import { derived, writable } from "svelte/store";
const currentLocale = writable(null);
const currentTrans = writable(null);
const allTranslations = {};
window.allTranslations = allTranslations;
const init = (translations = {}, locale = null) => {
  Object.assign(allTranslations, translations);
  if (locale) {
    if (locale in allTranslations === false) {
      throw new Error(`No translations for locale: ${locale}`);
    }
    currentLocale.set(locale);
    currentTrans.set(allTranslations[locale]);
  }
};
const setTranslation = (locale, path, value) => {
  let obj = allTranslations[locale];
  let prevObj = obj;
  if (Array.isArray(path)) {
  } else {
    const parts = path.split(".");
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
    }
    for (const part of parts) {
      prevObj = obj;
      if (part in obj === false) {
        obj[part] = {};
      }
      obj = obj[part];
    }
    prevObj[parts.length - 1] = value;
  }
};
const translate = ($locale, path, params = {}) => {
  if ($locale === null) {
    return Array.isArray(path) ? path.join(",") : path;
  }
  if ($locale in allTranslations === false) {
    throw new Error(`No translations for locale: ${$locale}`);
  }
  let obj = allTranslations[$locale];
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
  init,
  currentLocale as locale,
  setTranslation,
  t
};
//# sourceMappingURL=svelte-i18n.mjs.map
