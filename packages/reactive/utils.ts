export function isObject(val:unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

export function isFunction(val:unknown): val is Function {
  return typeof val === 'function';
}

export function isCollection(val: unknown) {
  return val instanceof Map || val instanceof WeakMap || val instanceof Set || val instanceof WeakSet;
}