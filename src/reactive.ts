
import { track, trigger } from './track';
const proxyMap = new WeakMap();

function createProxy<T extends object>(obj: T) {
  const proxy = new Proxy<T>(obj, {
    get(target, key, receiver) {
      track(target, key);
      return reactive(Reflect.get(target, key, receiver));
    },
    set(target, key, value) {
      if (Reflect.get(target, key) !== value) {
        Reflect.set(target, key, value);
        trigger(target, key);
      }
      return true;
    }
  });
  proxyMap.set(obj, proxy);
  return proxy;
}

export function reactive<T extends object>(obj: T): T {
  if (typeof obj !== 'object') {
    return obj;
  }
  if (!proxyMap.has(obj)) {
    proxyMap.set(obj, createProxy(obj));
  }
  return proxyMap.get(obj);
}

export function ref(initVal?: any) {
  console.assert(typeof initVal !== 'object', 'should not use ref on object');

  return reactive({
    value: initVal
  });
}
