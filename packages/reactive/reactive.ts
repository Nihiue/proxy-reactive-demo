
import { track, trigger } from './track.js';
import { isObject, isCollection } from './utils.js';
const proxyMap = new WeakMap();
const arraySizeMap = new WeakMap();

export const KEYS = {
  IS_REACTIVE: '_x_is_reactive',
  GET_RAW: '_x_get_raw_object'
};

const defaultHandler: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === KEYS.IS_REACTIVE) {
      return true;
    }
    if (key === KEYS.GET_RAW) {
      return target;
    }
    track(target, key);
    return reactive(Reflect.get(target, key, receiver));
  },
  set(target, key, value, receiver) {
    if (Reflect.get(target, key, receiver) !== value) {
      Reflect.set(target, key, value, receiver);
      trigger(target, key);
    } else if (key === 'length' && Array.isArray(target) && arraySizeMap.get(target) !== value) {
      arraySizeMap.set(target, value);
      trigger(target, key);
    }
    return true;
  }
};

export function reactive<T extends object>(target: T): T {
  if (
    !isObject(target) || 
    Reflect.get(target, KEYS.IS_REACTIVE) || 
    isCollection(target)
  ) {
    return target;
  } 
  
  if (!proxyMap.has(target)) {
    proxyMap.set(target, new Proxy<T>(target, defaultHandler));
  }

  return proxyMap.get(target);
}

export function ref(initVal?: any) {
  if (isObject(initVal)) {
    throw new Error('should not use ref on object');
  }

  return reactive({
    value: initVal
  });
}
