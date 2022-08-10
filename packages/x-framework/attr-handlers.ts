import { App } from './index.js';
import { toCamelcase } from './utils.js';

type RenderFunctionOption =  { 
  // args: 新函数的形参
  // body: 新函数的函数体
  // values: 绑定到形参的值
  args: string[], 
  body: string, 
  values: any[] 
}

type AttrHandler = (
  appThis: App, 
  registerRender: Function, 
  context: { el: HTMLElement, attrName: string, attrValue: string }
) => void;

function makeRenderFunction({ args , body, values }: RenderFunctionOption, appThis: App): Function {
  // 这里自动添加了一个新的形参 { methods, data },  并且给其提供值为 appThis
  // 目的是在模板函数中可以不通过 this 直接访问这两个属性，使得模板更加干净
  return new Function('{ methods, data }', ...args, body).bind(appThis, appThis, ...values);
}

export const attrHandlers: Map<string, AttrHandler> = new Map();

attrHandlers.set('x-bind', function (appThis, registerRender, { el, attrName, attrValue }) {
  let [ prefix, propName ] = attrName.split(':');
  propName = toCamelcase(propName);

  const funcOpt: RenderFunctionOption = {
    args: ['$el'],
    body: `$el.${propName} = ${attrValue}`,
    values: [ el ]
  };

  if (propName === 'class') {
    // 特殊处理 bind:class
    funcOpt.body = `
      const classDict = ${attrValue};
      Object.keys(classDict).forEach(function (className) {
        $el.classList[classDict[className] ? 'add' : 'remove'](className);
      });
   `;
  }

  if (propName === 'style') {
    // 特殊处理 bind:style
    funcOpt.body = `
      const styleDict = ${attrValue};
      $el.style = Object.keys(styleDict).map(function (styleName) {
        return styleName + ':' + styleDict[styleName];
      }).join(';');
   `;
  }

  const func = makeRenderFunction(funcOpt, appThis);
  if (prefix.includes('.once')) {
    func();
  } else {
    registerRender(func, `${attrName} => ${attrValue}`);
  }
});

attrHandlers.set('x-on', function (appThis, registerRender, { el, attrName, attrValue }) {
  const [ prefix, eventName ] = attrName.split(':');

  const listener:any = makeRenderFunction({
    args: [ '$event' ],
    body: attrValue,
    values: []
  }, appThis);

  el.addEventListener(eventName, listener);
});

attrHandlers.set('x-show', function (appThis, registerRender, { el, attrName, attrValue }) {
  const func = makeRenderFunction({
    args: ['$el'],
    body: `$el.style.display = (${attrValue}) ? 'initial' : 'none'`,
    values: [ el ]
  }, appThis);

  registerRender(func, `${attrName} => ${attrValue}`);
});

attrHandlers.set('$custom-directive', function (appThis, registerRender, { el, attrName, attrValue }) {
  const directiveName = attrName.slice(2);
  const func = makeRenderFunction({
    args: ['$el'],
    body: `this.directives['${directiveName}']($el, { value: ${attrValue} })`,
    values: [ el ]
  }, appThis);
  registerRender(func, `${attrName} => ${attrValue}`);
});
