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
      const func = new Function('computedFuncs', `this.computed['${val}'] = computedFuncs['${val}']()`).bind(app, computedFuncs);
      if (options.debug) {
        func.effect_debug_info = `computed => ${val}`;
      }
      watchEffect(func);
    });
  }

  if (app.watch) {
    Object.keys(app.watch).forEach(function (val) {
      const func = new Function(`this.watch['${val}'](this.${val})`).bind(app);
      if (options.debug) {
        func.effect_debug_info = `watch => ${val}`;
      }
      watchEffect(func);
    });
  }

  const renderEffects = bindDOM(rootEl, app, options);
  renderEffects.forEach(effect => {
    watchEffect(effect);
  });

  if (app.mounted) {
    app.mounted();
  }
}
