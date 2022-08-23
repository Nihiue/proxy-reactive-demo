import { getSubscribersSet, KeyType } from './subscribers.js';
import { isFunction } from './utils.js';

let activeEffect: Function | undefined;

const debugZeroPt = Date.now();
const nextTickSet: Set<Function> = new Set();

function flushTick() {
  const effects = Array.from(nextTickSet);
  nextTickSet.clear();

  for (let i = 0; i < effects.length; i += 1) {
    effects[i]();
  }
}

export function nextTick(effect: Function) {
  if (!isFunction(effect)) {
    throw new Error('invalid function');
  }

  if (nextTickSet.size === 0) {
    setTimeout(flushTick, 30);
  }

  nextTickSet.add(effect);
}

export function track(target: Object, key: KeyType) {
  if (!activeEffect) {
    return;
  }
  const subscribers = getSubscribersSet(target, key);
  subscribers.add(activeEffect);
}

export function trigger(target:Object, key: KeyType) {
  const effects = getSubscribersSet(target, key);
  effects.forEach(nextTick);
  effects.clear();
}

export function watchEffect(update: any, debug?: boolean) {
  if (!isFunction(update)) {
    throw new Error('invalid function');
  };

  const effect = function () {
    activeEffect = effect;
    if (debug) {
      console.debug(
        `+${Math.floor((Date.now() - debugZeroPt) / 1000)}s`,
        'effect',
        update.name
      );
    }
    update();
    activeEffect = undefined;
  }
  effect();
  return effect;
}
