import { getSubscribersSet, KeyType } from './subscribers';

let activeEffect: Function | undefined;

export function track(target: Object, key: KeyType) {
  if (!activeEffect) {
    return;
  }
  const subscribers = getSubscribersSet(target, key);
  subscribers.add(activeEffect);
}

export function trigger(target:Object, key: KeyType) {
  getSubscribersSet(target, key).forEach(sub => sub());
}


export function watchEffect(update: Function) {
  const effect = function () {
    activeEffect = effect;
    update();
    activeEffect = undefined;
  }
  effect();
  return effect;
}
