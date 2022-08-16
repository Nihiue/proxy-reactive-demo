import { App } from './app.js';
import { toCamelcase } from './utils.js';
import { DOMAttributeHandler, RenderEffect } from './dom.js';

type EffectOptions =  {
  // args: 新函数的形参
  // body: 新函数的函数体
  // values: 绑定到形参的值
  args: string[],
  body: string,
  values: any[]
}

function makeFunction({ args , body, values }: EffectOptions, appThis: App): RenderEffect {
  // 这里自动添加了一个新的形参 { methods, data },  并且给其提供值为 appThis
  // 目的是在模板函数中可以不通过 this 直接访问这两个属性，使得模板更加干净
  return new Function('{ methods, data, computed }', ...args, body).bind(appThis, appThis, ...values);
}

function resolveValue(name:string, appThis: App) {
  return makeFunction({
    args: [],
    body: `return ${name}`,
    values: []
  }, appThis)();
}

export const attrHandlers: Map<string, DOMAttributeHandler> = new Map();

attrHandlers.set('x-bind', function (appThis, registerEffect, { el, attrName, attrValue }) {
  let [ prefix, propName ] = attrName.split(':');
  propName = toCamelcase(propName);

  const opt: EffectOptions = {
    args: ['$el'],
    body: `$el.${propName} = ${attrValue}`,
    values: [ el ]
  };

  if (propName === 'class') {
    // 特殊处理 bind:class
    opt.body = `
      const classDict = ${attrValue};
      Object.keys(classDict).forEach(function (className) {
        $el.classList[classDict[className] ? 'add' : 'remove'](className);
      });
   `;
  }

  if (propName === 'style') {
    // 特殊处理 bind:style
    opt.body = `
      const styleDict = ${attrValue};
      $el.style = Object.keys(styleDict).map(function (styleName) {
        return styleName + ':' + styleDict[styleName];
      }).join(';');
   `;
  }

  const effect = makeFunction(opt, appThis);
  if (prefix.includes('.once')) {
    effect();
  } else {
    registerEffect(effect, `${attrName} => ${attrValue}`);
  }
});

attrHandlers.set('x-on', function (appThis, registerEffect, { el, attrName, attrValue }) {
  const [ prefix, eventName ] = attrName.split(':');

  const listener:any = makeFunction({
    args: [ '$el', '$event' ],
    body: attrValue,
    values: [ el ]
  }, appThis);

  el.addEventListener(eventName, listener);
});

attrHandlers.set('x-show', function (appThis, registerEffect, { el, attrName, attrValue }) {
  const effect = makeFunction({
    args: ['$el'],
    body: `$el.style.display = (${attrValue}) ? 'initial' : 'none'`,
    values: [ el ]
  }, appThis);

  registerEffect(effect, `${attrName} => ${attrValue}`);
});

attrHandlers.set('x-model', function (appThis, registerEffect, { el, attrName, attrValue }) {
  const nodeName = el.nodeName;
  let eventName = 'input';
  const isBindingArray = Array.isArray(resolveValue(attrValue, appThis));

  const effectOpt:EffectOptions = {
    args: ['$el'],
    body: `$el.value = ${attrValue}`,
    values: [ el ]
  };

  const listenerOpt:EffectOptions = {
    args: [ '$el', '$event' ],
    body: `${attrValue} = $el.value`,
    values: [ el ]
  };

  if (nodeName === 'INPUT') {
    const inputType = el.getAttribute('type');
    if (inputType === 'checkbox' || inputType === 'radio') {
      eventName = 'change';
      effectOpt.body = `$el.checked = (${attrValue} === $el.value)`;
      listenerOpt.body = `${attrValue} = ($el.checked ? $el.value : '')`;

      if (isBindingArray && inputType === 'checkbox') {
        effectOpt.body = `$el.checked = (${attrValue}.includes($el.value))`;
        listenerOpt.body = `
          const valIdx = ${attrValue}.indexOf($el.value);
          if ($el.checked && valIdx === -1) {
            ${attrValue}.push($el.value);
          } else if (!$el.checked && valIdx > -1) {
            ${attrValue}.splice(valIdx, 1);
          }
        `;
      }
    }
  }

  if (nodeName === 'SELECT') {
    eventName = 'change';
    if (isBindingArray) {
      el.setAttribute('multiple', '');
      effectOpt.body = `Array.from($el.options).forEach(function(opt) {
        opt.selected = ${attrValue}.includes(opt.value);
      })`;
      listenerOpt.body = `
        ${attrValue} = Array.from($el.selectedOptions).map(function(opt) {
          return opt.value;
        });
      `;
    }
  }

  const effect = makeFunction(effectOpt, appThis);

  registerEffect(effect, `${attrName} => ${attrValue}`);

  const listener:any = makeFunction(listenerOpt, appThis);

  el.addEventListener(eventName, listener);
});

attrHandlers.set('$custom-directive', function (appThis, registerEffect, { el, attrName, attrValue }) {
  const directiveName = attrName.slice(2);
  const effect = makeFunction({
    args: ['$el'],
    body: `this.directives['${directiveName}']($el, { value: ${attrValue} })`,
    values: [ el ]
  }, appThis);
  registerEffect(effect, `${attrName} => ${attrValue}`);
});
