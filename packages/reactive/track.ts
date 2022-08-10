import { getSubscribersSet, KeyType } from './subscribers.js';

let activeEffect: Function | undefined;

const TickInterval = 100;
const appStartTime = Date.now();
const nextTickSubs: Set<Function> = new Set();

setInterval(function() {
  if (nextTickSubs.size === 0) {
    return;
  }
  const effects = Array.from(nextTickSubs);
  nextTickSubs.clear();

  for (let i = 0; i < effects.length; i += 1) {
    effects[i]();
  }

}, TickInterval);


export function track(target: Object, key: KeyType) {
  if (!activeEffect) {
    return;
  }
  const subscribers = getSubscribersSet(target, key);
  subscribers.add(activeEffect);
}

export function trigger(target:Object, key: KeyType) {
  const effects = getSubscribersSet(target, key);

  effects.forEach(function(effect) {
    nextTickSubs.add(effect);
  });

  effects.clear();
}

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
