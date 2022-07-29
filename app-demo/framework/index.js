import { initDom } from './dom';
import { watchEffect } from '../../lib/src/index';

export function frameworkInit(mountSel, app) {
  if (app.methods) {
    Object.keys(app.methods).forEach(function (name) {
      app.methods[name] = app.methods[name].bind(app);
    });
  }

  if (app.directives) {
    Object.keys(app.directives).forEach(function (name) {
      app.directives[name] = app.directives[name].bind(app);
    });
  }

  if (app.watch) {
    Object.keys(app.watch).forEach(function (val) {
      const func = new Function(`this.watch['${val}'](${val})`).bind(app);
      watchEffect(func);
    });
  }

  const renderFuncs = initDom(document.querySelector(mountSel), app);
  renderFuncs.forEach(render => {
    watchEffect(render);
  });
}
