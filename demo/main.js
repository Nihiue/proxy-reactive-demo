import './style.css'
import { reactive, startApp } from 'x-framework';

function setup() {
  const data = reactive({
    name: 'guest',
    birthYear: 1992,
    height: 160,
    errorReason: '',
    nestedObj: {
      value: 10
    }
  });

  const methods = {
    calcAge() {
      return (new Date()).getFullYear() - data.birthYear;
    },
    generateRandomName() {
      data.name = Math.round(Math.random() * 0xfffff).toString(16);
    },
    getBirthYearOptions() {
      const arr = [];
      for (let i = 1980; i < 2025; i += 1) {
        arr.push(`<option value="${i}">${i}</option>`);
      }
      return arr.join('\n');
    }
  };

  const watch = {
    'data.name'(val) {
      if (val.length > 10) {
        data.errorReason = 'long';
      } else if (val.length < 4) {
        data.errorReason = 'short';
      } else {
        data.errorReason = '';
      }
    }
  };

  const directives = {
    img(el, binding) {
      if (/img/i.test(el.nodeName)) {
        el.src = binding.value;
      } else {
        el.style.backgroundImage = `url("${binding.value}")`;
      }
    },
    focus(el, binding) {
      el.focus();
    }
  };

  const appInstance = {
    data,
    methods,
    watch,
    directives,
  };

  return appInstance;
}

const app = setup();

startApp(document.querySelector('#app'), app, {
  debug: true
});
