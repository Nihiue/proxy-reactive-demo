
import { App } from './index.js';

export function toCamelcase(str: string): string {
  if (!str.includes('-')) {
    return str;
  }

  return str.split('-').map(function(seg, index) {
    if (seg.length && index > 0) {
      if (seg === 'html') {
        return 'HTML';
      }
      return seg[0].toUpperCase() + seg.slice(1);
    } else {
      return seg;
    }
  }).join('');
}

export function bindHelper(obj: Record<string, any> | undefined, app: App) {
  if (!obj) {
    return;
  }
  Object.keys(obj).forEach(function (name) {
    if (typeof obj[name] === 'function') {
      obj[name] = obj[name].bind(app);
    }
  });
}
