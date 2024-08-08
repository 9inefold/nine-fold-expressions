import { base } from '$lib/config';

export const makeUrl = (url: string): string => {
  if (base?.length && url.startsWith(base)) {
    return url;
  } else if (url.startsWith('@')) {
    return url.replace('@', `${base}/`);
  } else if (url.startsWith('/')) {
    return `${base}${url}`;
  }
  return `${base}/${url}`;
};

export const makeCssUrl = (url: string): string => {
  const reg = /url *\(/;
  if (url.match(reg))
    return url;
  const absUrl = makeUrl(url);
  return `url("${absUrl}")`;
};
