import './style.css'
import { reactive } from '../lib/src/index';
import { frameworkInit } from './framework/index';

function setup() {
  const data = reactive({
    name: 'guest'
  });

  const methods = {
    countNameLength() {
      return data.name.length;
    },
    generateRandomName() {
      data.name = Math.round(Math.random() * 0xfffff).toString(16);
    }
  };

  const watch = {
    'this.data.name'(val) {
      console.log('name has changed to', val);
    }
  };

  const appInstance = {
    data,
    methods,
    watch,
  };

  return appInstance;
}

const app = setup();

frameworkInit('#app', app);
