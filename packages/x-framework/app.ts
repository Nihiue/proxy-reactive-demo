import { watchEffect, reactive } from '../reactive/index.js';

import { bindHelper } from './utils.js';
import { bindDOM } from './dom.js';

export type App = {
  $el ?: HTMLElement,
  mounted ?: Function,
  methods ?: Record<string, Function>,
  directives ?: Record<string, Function>,
  watch ?: Record<string, Function>,
  computed ?: Record<string, any>,
  data ?: Record<string, any>,
};

export type AppOptions = {
  debug ?: boolean;
};

export function startApp(rootEl: HTMLElement, app:App, options: AppOptions = {}) {
  app.$el = rootEl;
  bindHelper(app.methods, app);
  bindHelper(app.directives, app);
  bindHelper(app.watch, app);

  if (app.computed) {
    bindHelper(app.computed, app);
    const computedFuncs = app.computed;
    app.computed = reactive({});

    Object.keys(computedFuncs).forEach(function (val) {
      const func = new Function('computedFuncs', `this.computed['${val}'] = computedFuncs['${val}']()`);
      Object.defineProperty(func, 'name', { value: `computed => ${val}` });
      watchEffect(func.bind(app, computedFuncs), options.debug);
    });
  }

  if (app.watch) {
    Object.keys(app.watch).forEach(function (val) {
      const func = new Function(`this.watch['${val}'](this.${val})`);
      Object.defineProperty(func, 'name', { value: `watch => ${val}` });
      watchEffect(func.bind(app), options.debug);
    });
  }

  const renderEffects = bindDOM(rootEl, app, options);
  renderEffects.forEach(effect => {
    watchEffect(effect, options.debug);
  });

  if (app.mounted) {
    app.mounted();
  }
}
