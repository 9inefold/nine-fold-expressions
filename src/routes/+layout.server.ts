import { type Preferences } from '$util/types';
import { getCookie } from '$util/cookies';

export const prerender = true;

export async function load({ cookies }): Promise<Preferences> {
  return {
    vfx: getCookie('vfx', cookies) ?? false
  }
}
