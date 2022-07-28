
const proxyMap = new WeakMap();
import { track, trigger } from './track';

export function reactive<T extends object>(obj: T) {
  if (typeof obj !== 'object') {
    return obj;
  }
  let ret = proxyMap.get(obj);

  if (!ret) {
    ret = new Proxy<T>(obj, {
      get(target, key) {
        track(target, key);
        return reactive(Reflect.get(obj, key));
      },
      set(target, key, value) {
        Reflect.set(obj, key, value);
        trigger(target, key);
        return true;
      }
    });
    proxyMap.set(obj, ret);
  }

  return ret;
}

export function ref(value?: any) {
  const refObject = {
    get value() {
      track(refObject, 'value');
      return value;
    },
    set value(newValue) {
      value = newValue;
      trigger(refObject, 'value');
    }
  }
  return refObject;
}
