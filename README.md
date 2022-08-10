# Proxy Reactive Demo

这是一次技术分享的代码 Repo

设计主要参照了 vue3 的响应式原理文档，相较于官方文档，会更注重探究设计背后的思路以及一些关键的细节

[PDF版本讲义](https://github.com/Nihiue/proxy-reactive-demo/blob/master/doc/doc.pdf)

## 基于 Proxy 的数据响应式 Reactive 原理及实现

代码实现在 `src/`

```javascript

const myObj = reactive({
  a: 1,
  b: 2
});

watchEffect(() => {
  console.log(`a + b is ${myObj.a + myObj.b}`);
});

myObj.a = 2;

setInterval(() => {
  myObj.a += 1;
}, 1000);

```


### 基于响应式系统 100 行代码实现一个迷你前端框架

代码实现在 `app-demo/framework`

实现一个最小版本的 MVVM 框架，展示响应式系统的应用场景

目标

- 类 vue API
- 支持 v-on, v-show, v-bind 等核心 dom 指令
- 支持 watch 机制
- 支持扩展 directive

简单起见，不实现

- vdom 及模板引擎
- 组件机制
- v- for 及 v-if 等与vdom关系密切的功能

运行测试应用

```bash

npm run dev:demo

```