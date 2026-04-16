import * as prefs from "$util/preferences";

type CookieLike = {
  get: (key: string) => string | null | undefined;
};

/// Sets a value in the browser's cookies.
export function setCookie<K extends keyof prefs.PreferencesTagNameMap>(key: K, value: prefs.PreferenceType<K>, path = "/") {
  return prefs.setPreference(key, {
    setter: (k, v) => {
      const current = new Date();
      const future = new Date(current.getTime() + (100 * 365 * 24 * 60 * 60 * 1000));
      const expires = future.toUTCString();
      document.cookie = `${k}=${v}; expires=${expires}; path=${path}`;
    }
  }, value);
}

/// Gets a value in the browser's cookies.
export function getCookie<K extends keyof prefs.PreferencesTagNameMap, F extends CookieLike>(key: K, cookies: F) {
  return prefs.getPreference(key, { getter: cookies.get });
}
