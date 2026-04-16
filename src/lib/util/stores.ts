import { writable } from "svelte/store";
import * as prefs from "$util/preferences";

export { SIMPLIFY_VFX } from "$util/preferences";

/// Sets a value in the localStore.
export function setStore<K extends keyof prefs.PreferencesTagNameMap>(key: K, value: prefs.PreferenceType<K>) {
  return prefs.setPreference(key, {
    setter: (k, v) => localStorage.setItem(k, v)
  }, value);
}

export function getStore<K extends keyof prefs.PreferencesTagNameMap>(key: K, _default?: prefs.PreferenceType<K>) {
  if (!localStorage)
    return;
  return prefs.getPreference(key, {
    getter: (k) => localStorage.getItem(k),
    setter: (k, v) => localStorage.setItem(k, v)
  }, _default);
}

//let storedVfx = getVfx(defaultVfx);
export const vfx = writable<boolean>();
