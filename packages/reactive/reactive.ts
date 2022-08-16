
import { track, trigger } from './track.js';
import { isObject } from './utils.js';
const proxyMap = new WeakMap();

function createProxy<T extends object>(obj: T) {
  const proxy = new Proxy<T>(obj, {
    get(target, key, receiver) {
      track(target, key);
      return reactive(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
      const lastVal = Reflect.get(target, key, receiver);
      if (lastVal !== value) {
        Reflect.set(target, key, value, receiver);
        trigger(target, key);
      }
      if (Array.isArray(target) && typeof lastVal === 'undefined') {
        trigger(target, 'length');
      }
      return true;
    }
  });
  proxyMap.set(obj, proxy);
  return proxy;
}

export function reactive<T extends object>(obj: T): T {
  if (!isObject(obj)) {
    return obj;
  }
  if (!proxyMap.has(obj)) {
    proxyMap.set(obj, createProxy(obj));
  }
  return proxyMap.get(obj);
}

export function ref(initVal?: any) {
  console.assert(!isObject(initVal), 'should not use ref on object');

  return reactive({
    value: initVal
  });
}
