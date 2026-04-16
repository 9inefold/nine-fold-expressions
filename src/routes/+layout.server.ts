import { type Preferences } from '$util/types';
import { SIMPLIFY_VFX } from "$util/preferences";
import { getCookie } from '$util/cookies';

export const prerender = true;

export async function load({ cookies }): Promise<Preferences> {
  return {
    //vfx: getCookie(SIMPLIFY_VFX, cookies) ?? false
    vfx: cookies.get(SIMPLIFY_VFX) === 'true'
  }
}
