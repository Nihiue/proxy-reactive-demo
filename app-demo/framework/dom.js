import { toCamelcase } from './utils';

function handleBind(appThis, registerRender, el, attr) {
  let [ prefix, propName ] = attr.split(':');
  const attrVal = el.getAttribute(attr);
  propName = toCamelcase(propName);

  let func;

  if (propName === 'class') {
    // 特殊处理 bind:class
    func = new Function('$el', `
     const classDict = ${attrVal};
     Object.keys(classDict).forEach(function (className) {
       $el.classList[classDict[className] ? 'add' : 'remove'](className);
     });
    `).bind(appThis, el)
  } else {
    func = new Function('$el', `$el.${propName} = ${attrVal}`).bind(appThis, el);
  }
  if (prefix.includes('.once')) {
    func();
  } else {
    registerRender(func);
  }
}

function handleOn(appThis, registerRender, el, attr) {
  const [ prefix, eventName ] = attr.split(':');
  const attrVal = el.getAttribute(attr);

  el.addEventListener(eventName, new Function('$event', attrVal).bind(appThis));
}

function handleShow(appThis, registerRender, el, attr) {
  const attrVal = el.getAttribute(attr);
  const func = new Function('$el', `$el.style.display = (${attrVal}) ? 'initial' : 'none'`).bind(appThis, el);
  registerRender(func);
}

export function initDom(rootEl, appThis) {
  const renderFuncArray = [];

  function registerRender(func) {
    renderFuncArray.push(func);
  }

  const attrHandlers = {
    'x-bind': handleBind,
    'x-on': handleOn,
    'x-show': handleShow
  };

  Array.from(rootEl.querySelectorAll('*')).forEach(function (el) {
    el.getAttributeNames().forEach(function(attr) {
      Object.keys(attrHandlers).forEach(function(prefix) {
        if (attr.startsWith(prefix)) {
          attrHandlers[prefix](appThis, registerRender, el, attr);
          el.removeAttribute(attr);
        }
      });
    });
  });

  return renderFuncArray;
}