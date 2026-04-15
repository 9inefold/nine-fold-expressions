import { browser } from "$app/environment";
import { writable } from "svelte/store";

const SIMPLIFY_VFX = 'simplify-vfx';
const defaultVfx = false;

function setVfx(value: string | boolean) {
  if (!browser)
    return;
  if (typeof value === 'string') {
    localStorage.setItem(SIMPLIFY_VFX, value);
  } else {
    localStorage.setItem(SIMPLIFY_VFX, `${value}`);
  }
}

function loadVfx(): boolean {
  if (!browser)
    return defaultVfx;
  // Retrieve localStorage value if it's been set already
  const valueStr = localStorage.getItem(SIMPLIFY_VFX);
  if (!valueStr) {
    setVfx(defaultVfx);
    return defaultVfx;
  }
  // Parse value
  if (valueStr === 'true') {
    return true;
  } else if (valueStr === 'false') {
    return false;
  } else {
    setVfx(defaultVfx);
    return defaultVfx;
  }
}

let storedVfx = loadVfx();
export const vfx = writable(storedVfx);
// subscribe to changes
vfx.subscribe((val) => setVfx(val));
