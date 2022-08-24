
import { track, trigger } from './track.js';
import { isObject, isCollection, isPromise } from './utils.js';
const proxyMap = new WeakMap();
const arraySizeMap = new WeakMap();

export const SYMBOLS = {
  IS_REACTIVE: Symbol('IS_REACTIVE'),
  GET_RAW: Symbol('GET_RAW'),
};

const defaultHandler: ProxyHandler<object> = {
  get(target, key, receiver) {
    if (key === SYMBOLS.IS_REACTIVE) {
      return true;
    }
    if (key === SYMBOLS.GET_RAW) {
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
    Reflect.get(target, SYMBOLS.IS_REACTIVE) || 
    isPromise(target) ||
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
