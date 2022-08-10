import { App, AppOptions } from './index.js';
import { attrHandlers } from './attr-handlers.js';

type RenderFunction = Function & { effect_debug_info: string };

export function bindDOM(rootEl: HTMLElement, appThis: App, options: AppOptions) {
  const renderFuncArray: RenderFunction[] = [];

  function registerRender(func: RenderFunction, desc = '') {
    if (options.debug) {
      func.effect_debug_info = desc;
    }
    renderFuncArray.push(func);
  }

  const customDirectives = appThis.directives || {};
  const domElements: HTMLElement[] = Array.from(rootEl.querySelectorAll('*'));
  
  if (rootEl.nodeName === 'BODY') {
    domElements.unshift(rootEl);
  }

  const validAttrPrefix = Array.from(attrHandlers.keys());

  domElements.forEach(function (el) {
    el.getAttributeNames().forEach(function(attrName) {
      if (!attrName.startsWith('x-')) {
        return;
      }
      validAttrPrefix.some(function(prefix) {
        if (attrName.startsWith(prefix)) {
          const attrValue = el.getAttribute(attrName) || 'null';
          const handler = attrHandlers.get(prefix);
          handler && handler(appThis, registerRender, {
            el,
            attrName,
            attrValue
          });
          el.removeAttribute(attrName);
          return true;
        }
      });

      if (customDirectives[attrName.slice(2)]) {
        const attrValue = el.getAttribute(attrName) || 'null';
        const handler = attrHandlers.get('$custom-directive');
        handler && handler(appThis, registerRender, {
          el,
          attrName,
          attrValue
        });
        el.removeAttribute(attrName);
      }
    });
  });

  return renderFuncArray;
}