import { browser } from "$app/environment";
import { TypeTag, PreferencesTag, PreferencesTagRemap } from "$util/types";
import type { Preferences, PreferencesTagNameMap } from "$util/types";

export { PreferencesTag, PreferencesTagRemap } from "$util/types";
export type { Preferences, PreferencesTagNameMap } from "$util/types";

export type TypeString = `${TypeTag}`;
export type PreferenceType<K extends keyof PreferencesTagNameMap>
    = PreferencesTagNameMap[K] | undefined;

type Setter = {
  setter: (key: string, value: string) => void
};
type Getter = {
  getter: (key: string) => string | null | undefined,
  setter?: (key: string, value: string) => void
}

export const SIMPLIFY_VFX = 'vfx';

/// Sets a value in the localStore.
export function setPreference<K extends keyof PreferencesTagNameMap>(
    key: K, data: Setter, value: PreferenceType<K>,
) {
  if (!browser || typeof value === 'undefined')
    return;
  // Now set the keys.
  const realKey = PreferencesTagRemap[key];
  data.setter(realKey, `${value}`);
  //console.trace(`${realKey}: ${value}`);
}

function parseStoreValue<K extends keyof Preferences>(key: K, value: string): any {
  const typeTag = PreferencesTag[key] as TypeString;
  switch (typeTag) {
    // boolean
    case 'boolean': {
      return value === 'true';
    }
    case 'number': {
      if (value.at(0) === '0') {
        const data = value.substring(2);
        switch (value.at(1)) {
          case 'x':
            return parseInt(data, 16);
          case 'b':
            return parseInt(data, 2);
          case 'c':
            return parseInt(data, 8);
        }
      }
      return parseInt(value);
    }
    case 'string':
      return value;
  }

  throw new Error(`Invalid TypeTag '${typeTag}'`);
}

export function getPreference<K extends keyof PreferencesTagNameMap>(
    key: K, data: Getter, _default?: PreferenceType<K>
): PreferenceType<K> {
  // Only run with the browser.
  if (!browser)
    return _default;

  const realKey = PreferencesTagRemap[key];
  const { getter, setter } = data;

  // Retrieve localStorage value if it's been set already
  const value = getter(realKey);
  //console.trace(`${realKey}: ${value}`);
  if (value == null || value == undefined) {
    if (setter && _default !== undefined)
      setter(realKey, `${_default}`);
    return _default;
  }

  return parseStoreValue(realKey, value) as PreferenceType<K>;
}
