
export function toCamelcase(str) {
  if (!str.includes('-')) {
    return str;
  }
  return str.split('-').map(function(seg, index) {
    if (seg.length && index > 0) {
      return seg[0].toUpperCase() + seg.slice(1);
    } else {
      return seg;
    }
  }).join('');
}