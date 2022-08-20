
import { track, trigger } from './track.js';
import { isObject, isCollection } from './utils.js';
const proxyMap = new WeakMap();
const arrayLengthMap = new WeakMap();

function createProxy<T extends object>(obj: T) {
  const proxy = new Proxy<T>(obj, {
    get(target, key, receiver) {
      track(target, key);
      return reactive(Reflect.get(target, key, receiver));
    },
    set(target, key, value, receiver) {
      if (Reflect.get(target, key, receiver) !== value) {
        Reflect.set(target, key, value, receiver);
        trigger(target, key);
      } else if (key === 'length' && Array.isArray(target) && arrayLengthMap.get(target) !== value) {
        arrayLengthMap.set(target, value);
        trigger(target, key);
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
  if (isCollection(obj)) {
    // console.debug('Collection is not supported yet');
    return obj;
  }
  if (!proxyMap.has(obj)) {
    proxyMap.set(obj, createProxy(obj));
  }
  return proxyMap.get(obj);
}

export function ref(initVal?: any) {
  if (isObject(initVal)) {
    throw new Error('should not use ref on object');
  }

  return reactive({
    value: initVal
  });
}
