import { reactive, ref, watchEffect } from '../src/index';

const myObj = reactive({
  a: 1,
  b: 2,
  c: {
    c: 2
  },
  d: [0]
});

const v = ref();

const myEffect = watchEffect(() => {
  console.log(`a + b is ${myObj.a + myObj.b}`);
  console.log(`d[0] is ${myObj.d[0]}`);
});

myObj.a = 2;

setInterval(() => {
  myObj.a += 1;
  myObj.d[0] += 1;
}, 1000);

