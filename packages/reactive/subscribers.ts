export type KeyType = string | symbol | number;

type ObjectSubMap = Map<KeyType, Set<Function>>;

const subscribers: WeakMap<Object, ObjectSubMap> = new WeakMap();

export function getSubscribersSet(target: Object, key: KeyType) {
  let targetSubs = subscribers.get(target);

  if (!targetSubs) {
    targetSubs = new Map();
    subscribers.set(target, targetSubs);
  }

  let keySubs = targetSubs.get(key);

  if (!keySubs) {
    keySubs = new Set();
    targetSubs.set(key, keySubs);
  }

  return keySubs;
}