import { getSubscribersSet, KeyType } from './subscribers.js';
import { isFunction, isAsyncFunction } from './utils.js';

let activeEffect: Function | undefined;

const debugZeroPt = Date.now();
const nextTickSet: Set<Function> = new Set();
const tickRunner = globalThis.requestAnimationFrame || setImmediate;

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
    tickRunner(flushTick);
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

  if (isAsyncFunction(update)) {
    throw new Error(`async function is not supported by watchEffect`);
  }

  function wrappedEffect() {
    if (debug) {
      console.debug(
        `+${Math.floor((Date.now() - debugZeroPt) / 1000)}s`,
        'effect',
        update.name
      );
    }
    activeEffect = wrappedEffect;
    update();
    activeEffect = undefined;
  }
  wrappedEffect();
  return wrappedEffect;
}
