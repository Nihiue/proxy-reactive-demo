import { toCamelcase } from './utils';

function renderFunction({ args, body, values }, appThis) {

  // args: 新函数的形参
  // body: 新函数的函数体
  // values: 绑定到形参的值

  // 这里自动添加了一个新的形参 { methods, data },  并且给其提供值为 appThis
  // 目的是在模板函数中可以不通过 this 直接访问这两个属性，使得模板更加干净

  return new Function('{ methods, data }', ...args, body).bind(appThis, appThis, ...values);
}

function handleBind(appThis, registerRender, el, attr) {
  let [ prefix, propName ] = attr.split(':');
  const attrVal = el.getAttribute(attr);
  propName = toCamelcase(propName);

  const funcOpt = {
    args: ['$el'],
    body: `$el.${propName} = ${attrVal}`,
    values: [ el ]
  };

  if (propName === 'class') {
    // 特殊处理 bind:class
    funcOpt.body = `
      const classDict = ${attrVal};
      Object.keys(classDict).forEach(function (className) {
        $el.classList[classDict[className] ? 'add' : 'remove'](className);
      });
   `;
  }
  const func = renderFunction(funcOpt, appThis);
  if (prefix.includes('.once')) {
    func();
  } else {
    registerRender(func, `${attr} => ${attrVal}`);
  }
}

function handleOn(appThis, registerRender, el, attr) {
  const [ prefix, eventName ] = attr.split(':');
  const attrVal = el.getAttribute(attr);

  const func = renderFunction({
    args: [ '$event' ],
    body: attrVal,
    values: []
  }, appThis);

  el.addEventListener(eventName, func);
}

function handleShow(appThis, registerRender, el, attr) {
  const attrVal = el.getAttribute(attr);
  const func = renderFunction({
    args: ['$el'],
    body: `$el.style.display = (${attrVal}) ? 'initial' : 'none'`,
    values: [ el ]
  }, appThis);

  registerRender(func, `${attr} => ${attrVal}`);
}

function handleCustomDirective(appThis, registerRender, el, attr, directiveName) {
  const attrVal = el.getAttribute(attr) || 'null';
  const func = renderFunction({
    args: ['$el'],
    body: `this.directives['${directiveName}']($el, { value: ${attrVal} })`,
    values: [ el ]
  }, appThis);
  registerRender(func, `${attr} => ${attrVal}`);
}

export function initDom(rootEl, appThis) {
  const renderFuncArray = [];

  function registerRender(func, desc = '') {
    func.effect_debug_info = desc;
    renderFuncArray.push(func);
  }

  const attrHandlers = {
    'x-bind': handleBind,
    'x-on': handleOn,
    'x-show': handleShow
  };

  const customDirectives = appThis.directives || {};

  Array.from(rootEl.querySelectorAll('*')).forEach(function (el) {
    el.getAttributeNames().forEach(function(attr) {
      if (!attr.startsWith('x-')) {
        return;
      }

      Object.keys(attrHandlers).forEach(function(prefix) {
        if (attr.startsWith(prefix)) {
          attrHandlers[prefix](appThis, registerRender, el, attr);
          el.removeAttribute(attr);
        }
      });

      if (customDirectives[attr.slice(2)]) {
        handleCustomDirective(appThis, registerRender, el, attr, attr.slice(2));
        el.removeAttribute(attr);
      }
    });
  });

  return renderFuncArray;
}