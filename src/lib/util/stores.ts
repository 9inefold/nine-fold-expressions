import { writable } from "svelte/store";
import * as Prefs from "$util/preferences";

export { SIMPLIFY_VFX } from "$util/preferences";

/// Sets a value in the localStore.
export function setStore<K extends keyof Prefs.PreferencesTagNameMap>(key: K, value: Prefs.PreferenceType<K>) {
  return Prefs.setPreference(key, {
    setter: (k, v) => localStorage.setItem(k, v)
  }, value);
}

export function getStore<K extends keyof Prefs.PreferencesTagNameMap>(key: K, _default?: Prefs.PreferenceType<K>) {
  if (!localStorage)
    return;
  return Prefs.getPreference(key, {
    getter: (k) => localStorage.getItem(k),
    setter: (k, v) => localStorage.setItem(k, v)
  }, _default);
}

//let storedVfx = getVfx(defaultVfx);
export const vfx = writable<boolean>();
