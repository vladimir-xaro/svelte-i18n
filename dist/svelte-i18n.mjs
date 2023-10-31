import{derived as y,readonly as p,writable as w}from"svelte/store";import g from"isobject";import x from"deepmerge";const c=(()=>{const{set:n,subscribe:r}=w(null);let s=null;r(t=>{s=t});const o=t=>{if(t!==s){if(t===null){n(null);return}if(!(t in l))throw new Error(`[@xaro/svelte-i18n] No translations for locale: "${t}"`);n(t)}};return{set:o,update:t=>o(t(s)),subscribe:r,setNullIf:t=>{s!==null&&t===s&&o(t)}}})();let b={};const h=w(b);h.subscribe(n=>b=n);const T=w(new Set),L=p(T),l={};window.allTranslations=l;const N=n=>{if(n){if("translations"in n){if(!g(n.translations))throw new Error("[@xaro/svelte-i18n] options.translations must be an object if passed");Object.assign(l,n.translations),T.update(r=>{for(const s in n.translations)r.add(s);return r})}if("defaultTranslations"in n){if(!g(n.defaultTranslations))throw new Error("[@xaro/svelte-i18n] options.defaultTranslations must be an object if passed");Object.keys(n.defaultTranslations).length&&h.update(r=>(Object.assign(r,n.defaultTranslations),r))}if("locale"in n){if(typeof n.locale!="string")throw new Error(`[@xaro/svelte-i18n] options.locale must be a string, ${typeof n.locale} passed`);if(!(n.locale in l))throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${n.locale}`);c.set(n.locale)}}},O=n=>n in l,k=n=>n in l?(delete l[n],c.setNullIf(n),!0):!1,m=(n,r,s,o=!1)=>{n in l||(l[n]={},T.update(t=>t.add(n)));let a=Array.isArray(r)?r:r.split(/\.+/);if(!a.length){if(!g(s))throw new Error("[@xaro/svelte-i18n] Translation cannot be a string when no path is given");l[n]=s;return}let e=l[n];for(let t=0;t<a.length;t++){const i=a[t];if(i)t===a.length-1?e[i]=s:(i in e||(e[i]={}),e=e[i]);else throw new Error("[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character")}o&&c.set(n)},I=(n,r,s,o=!1)=>{if(!(n in l)){m(n,r,s);return}let a=Array.isArray(r)?r:r.split(/\.+/);if(!a.length){if(!g(s))throw new Error("[@xaro/svelte-i18n] Translation cannot be a string when no path is given");l[n]=s;return}let e=l[n];for(let t=0;t<a.length;t++){const i=a[t];if(i)t===a.length-1?i in e&&g(e[i])&&g(s)?e[i]=x(e[i],s):e[i]=s:(i in e||(e[i]={}),e=e[i]);else throw new Error("[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character")}o&&c.set(n)},S=(n,r,s=!1)=>{if(!(n in l))throw new Error(`[@xaro/svelte-i18n] No translations for locale: ${n}`);let o=l[n],a=Array.isArray(r)?r:r.split(/\.+/);for(let e=0;e<a.length;e++){const t=a[e];if(t)e===a.length-1?delete o[t]:(t in o||(o[t]={}),o=o[t]);else throw new Error("[@xaro/svelte-i18n] Path cannot be empty, end or begin with a separator character")}s&&c.set(n)},v=(n,r,s,o)=>{const a=()=>o||(n&&n in b?b[n]:Array.isArray(r)?r.join(","):r);if(n===null||!(n in l))return a();let e=l[n];const t=i=>{if(typeof e[i]=="string"){let f=e[i];if(g(s)){const u=Object.keys(s);if(u.length)for(const d of u)f=f.replaceAll(`{{${d}}}`,s[d])}return f}return e=e[i],null};if(Array.isArray(r))n:for(const i of r)if(i in e){const f=t(i);if(f!==null)return f}else{const f=i.split(".");for(f.splice(-1);f.length;)if(f.join(".")in e){const d=t(i);if(d!==null)return d;continue n}else f.splice(-1);return console.log("here"),a()}else{const i=r.split(".");for(const f of i)if(f in e){const u=t(f);if(u!==null)return u}else return a()}return a()},W=y(c,n=>(r,s={},o)=>v(n,r,s,o));export{I as addTranslation,L as allLocales,O as hasLocale,N as init,c as locale,k as removeLocale,S as removeTranslation,m as setTranslation,W as t};
//# sourceMappingURL=svelte-i18n.mjs.map
