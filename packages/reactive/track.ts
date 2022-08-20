import { getSubscribersSet, KeyType } from './subscribers.js';

let activeEffect: Function | undefined;

const debugZeroPt = Date.now();
const nextTickBuffer: Set<Function> = new Set();

function flushNextTickBuffer() {
  const effects = Array.from(nextTickBuffer);
  nextTickBuffer.clear();

  for (let i = 0; i < effects.length; i += 1) {
    effects[i]();
  }
}

export function nextTick(effect: Function) {
  if (typeof effect !== 'function') {
    throw new Error('invalid function');
  }

  if (nextTickBuffer.size === 0) {
    setTimeout(flushNextTickBuffer, 30);
  }

  nextTickBuffer.add(effect);
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

  effects.forEach(function(effect) {
    nextTick(effect)
  });

  effects.clear();
}

export function watchEffect(update: any, debug?: boolean) {
  if (typeof update !== 'function') {
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
