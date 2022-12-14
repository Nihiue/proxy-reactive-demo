import { reactive, ref, watchEffect, nextTick, SYMBOLS } from '../packages/reactive/index.js';
import { equal, strictEqual, throws, notStrictEqual } from 'node:assert';

function waitForTick() {
  return new Promise(function (resolve, reject) {
    nextTick(resolve);
  })
}

describe('API test suite', function () {
  it('should ref accepts primitive values', async function() {
    const r = ref(1);
    strictEqual(r.value, 1);

    const symbol = Symbol('test');
    strictEqual(ref(symbol).value, symbol);
  });

  it('should ref rejects non-primitive values', async function() {
    throws(() => {
      ref({});
    });
  });

  it('should watchEffect accepts function', async function() {
    watchEffect(() => {});
  });

  it('should watchEffect rejects non-function', async function() {
    throws(() => {
      watchEffect([]);
    });
  });

  it('should watchEffect rejects async function', async function() {
    throws(() => {
      watchEffect(async function() {});
    });
  });

  it('should watchEffect print debug info', async function() {
    watchEffect(function debug() {}, true);
  });

  it('should nextTick rejects non-function', async function() {
    throws(() => {
      nextTick([] as any);
    });
  });

  it('should reactive wrap object and array', async function() {
    const arr = [ 1, 2 ];
    const obj = { foo: 1 };
    const rArr:any = reactive(arr);
    const rObj:any = reactive(obj);

    notStrictEqual(arr, rArr);
    notStrictEqual(obj, rObj);

    strictEqual(rArr[SYMBOLS.GET_RAW], arr);
    strictEqual(rObj[SYMBOLS.GET_RAW], obj);

    strictEqual(rObj[SYMBOLS.IS_REACTIVE], true);
    strictEqual(rObj[SYMBOLS.IS_REACTIVE], true);
  });

  it('should reactive ignore unsupported types', async function() {
    const set =  new Set();
    const map = new Map();
    const func = () => {};
    const promise = new Promise(() => {});

    strictEqual(set, reactive(set));
    strictEqual(map, reactive(map));
    strictEqual(func, reactive(func));
    strictEqual(promise, reactive(promise));
  });

  it('should reactive keep reactive values', async function() {
    const r = reactive({});
    strictEqual(r, reactive(r));
    strictEqual(r, reactive(reactive(r)));
  });
});

describe('Function test suite', function () {

  it('should be able to read', () => {
    const read = reactive({
      a: 1,
      b: { c: 2 },
      d: ['foo', 2]
    });
    strictEqual(read.a, 1);
    strictEqual(read.b.c, 2);
    strictEqual(read.d[0], 'foo');
  });

  it('should be able to write', async () => {
    const write:any = reactive({
      a: 1,
      b: { c: 2 },
      d: ['foo', 2]
    });

    write.a = 2;
    strictEqual(write.a, 2);

    write.b.c = 0xfe;
    strictEqual(write.b.c, 0xfe);

    write.newProp = 0xff;
    strictEqual(write.newProp, 0xff);

    write.d.push('bar');
    strictEqual(write.d[2], 'bar');
  });

  it('should detect basic change', async () => {
    let runCount = 0;
    const basic = reactive({
      value: 0
    });
    watchEffect(function() {
      runCount += 1;
      basic.value;
    });
    strictEqual(runCount, 1);
    basic.value = 1;
    strictEqual(runCount, 1);
    await waitForTick();
    strictEqual(runCount, 2);
  });

  it('should detect array change', async () => {
    const arrTest = reactive({
      value: 2,
      numbers: [0, 1, 2],
      sum: 0
    });
    watchEffect(function() {
      arrTest.sum = arrTest.numbers.reduce((prev:number, current: number) => prev + current, 0);
    });
    strictEqual(arrTest.sum, 3);

    arrTest.numbers.push(1);
    await waitForTick();
    strictEqual(arrTest.sum, 4);


    arrTest.numbers[3] = 2;
    await waitForTick();
    strictEqual(arrTest.sum, 5);

    arrTest.numbers = [];
    await waitForTick();
    strictEqual(arrTest.sum, 0);
  });

  it('should combine tick effect', async () => {
    const tickTest = ref(0);
    let runCount = 0;
    watchEffect(function() {
      tickTest.value;
      runCount += 1;
    });

    strictEqual(runCount, 1);

    for (let i = 0; i < 0xff; i += 1) {
      tickTest.value = i;
    }
    await waitForTick();
    strictEqual(runCount, 2);
  });

  it('should detect dependency change', async () => {

    const depTest = reactive({
      t: false,
      result: -1,
      s1: {
        m: 1,
        n: 3
      },
      s2: {
        m: 9,
        n: 10
      }
    });

    let runCount = 0;
    watchEffect(function() {
      runCount += 1;
      depTest.result = depTest[depTest.t ? 's1' : 's2'].m + depTest[depTest.t ? 's1' : 's2'].n;
    });

    strictEqual(runCount, 1);
    strictEqual(depTest.result, 19);

    depTest.s2.m = 22;
    await waitForTick();
    strictEqual(runCount, 2);
    strictEqual(depTest.result, 32);

    depTest.t = true;
    await waitForTick();
    strictEqual(runCount, 3);
    strictEqual(depTest.result, 4);

    depTest.s2.m = 55;
    await waitForTick();
    strictEqual(runCount, 4);
    strictEqual(depTest.result, 4);

    depTest.s2.m = 55;
    await waitForTick();
    strictEqual(runCount, 4);
    strictEqual(depTest.result, 4);

    depTest.s1.m = 100;
    await waitForTick();
    strictEqual(runCount, 5);
    strictEqual(depTest.result, 103);
  });
});

describe('Performance test suite', function () {
  const ArrSize = 0xffff;

  function mixTest(arr: number[]) {
    for (let i = 0; i < ArrSize; i += 1) {
      arr.push(arr[arr.length - 1] + arr[i] + 1);
    }
    for (let i = ArrSize - 2 * 0xff; i < ArrSize; i += 1) {
      arr.splice(i * 2, 2, 1);
    }
  }

  function getData() {
    return (new Array(ArrSize)).fill(1);
  }

  function getReader(data: number[]) {
    return function() {
      for (let i = 0; i < data.length; i += 1) {
        if (data[i] === i) {
          data[i] = - data[i];
        }
      }
    }
  }

  it('reference performance', async () => {
    const data = getData();
    getReader(data)();
    mixTest(data);
    await waitForTick();
  });

  it('reactive performance', async () => {
    
    const data = reactive(getData());
    watchEffect(getReader(data));
    mixTest(data);
    await waitForTick();
  });
});