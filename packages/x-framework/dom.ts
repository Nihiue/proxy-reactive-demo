import { App, AppOptions } from './app.js';
import { attrHandlers } from './attr-handlers.js';

export type DOMAttributeHandler = (
  appThis: App,
  context: { el: HTMLElement, attrName: string, attrValue: string }
) => Function | void;

export function bindDOM(rootEl: HTMLElement, appThis: App, options: AppOptions) {
  const renderEffects: Function[] = [];

  function applyHandler(el: HTMLElement, attrName: string, handler: DOMAttributeHandler) {
    const attrValue = el.getAttribute(attrName) || 'null';
    el.removeAttribute(attrName);

    const ret = handler(appThis, {
      el,
      attrName,
      attrValue
    });
    
    if (ret) {
      renderEffects.push(ret);
    }
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
          applyHandler(el, attrName, attrHandlers.get(prefix));
          return true;
        }
      });
      if (customDirectives[attrName.slice(2)]) {
        applyHandler(el, attrName, attrHandlers.get('$custom-directive'));
      }
    });
  });

  return renderEffects;
}