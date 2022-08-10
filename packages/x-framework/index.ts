import { watchEffect, reactive, ref } from '../reactive/index.js';
import { bindHelper } from './utils.js';
import { bindDOM } from './dom.js';

export type App = {
  methods?: Record<string, Function>,
  directives: Record<string, Function>,
  watch: Record<string, Function>,
  data: Record<string, any>,
};

export type AppOptions = {
  debug ?: boolean;
};

export function startApp(rootEl: HTMLElement, app:App, options: AppOptions = {}) {
  bindHelper(app.methods, app);
  bindHelper(app.directives, app);
  bindHelper(app.watch, app);

  if (app.watch) {
    Object.keys(app.watch).forEach(function (val) {
      const func = new Function(`this.watch['${val}'](this.${val})`).bind(app);
      if (options.debug) {
        func.effect_debug_info = `watch => ${val}`;
      }
      watchEffect(func);
    });
  }

  const renderFuncs = bindDOM(rootEl, app, options);
  renderFuncs.forEach(render => {
    watchEffect(render);
  });
}

export { reactive, ref, watchEffect };

