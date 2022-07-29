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

const appStartTime = Date.now();

export function watchEffect(update: any) {
  const effect = function () {
    activeEffect = effect;
    if (update.effect_debug_info) {
      console.debug(
        `+${Math.floor((Date.now() - appStartTime) / 1000)}s`,
        'effect',
        update.effect_debug_info
      );
    }
    update();
    activeEffect = undefined;
  }
  effect();
  return effect;
}
