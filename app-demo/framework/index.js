import { initDom } from './dom';
import { watchEffect } from '../../lib/src/index';

function bindHelper(obj, that) {
  if (!obj) {
    return;
  }
  Object.keys(obj).forEach(function (name) {
    if (typeof obj[name] === 'function') {
      obj[name] = obj[name].bind(that);
    }
  });
}

export function frameworkInit(mountSel, app) {

  bindHelper(app.methods, app);
  bindHelper(app.directives, app);
  bindHelper(app.watch, app);

  if (app.watch) {
    Object.keys(app.watch).forEach(function (val) {
      const func = new Function(`this.watch['${val}'](this.${val})`).bind(app);
      func.effect_debug_info = `watch => ${val}`;
      watchEffect(func);
    });
  }

  const renderFuncs = initDom(document.querySelector(mountSel), app);
  renderFuncs.forEach(render => {
    watchEffect(render);
  });
}
