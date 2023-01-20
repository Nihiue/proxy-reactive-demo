# Proxy Reactive Demo


![typescript](https://img.shields.io/npm/types/scrub-js.svg)
[![Test Suite](https://github.com/Nihiue/proxy-reactive-demo/actions/workflows/reactive-test.yaml/badge.svg)](https://github.com/Nihiue/proxy-reactive-demo/actions/workflows/reactive-test.yaml)

这是一次内部技术分享的代码 [讲义](https://rmz46ujgbm.feishu.cn/docx/doxcnAuHjEFuAdMBT6WTyrGhQjg)


## 基于 Proxy 的数据响应式 Reactive 原理及实现

主要参照了 vue3 的响应式原理文档，相较于官方文档，会更注重探究设计背后的思路以及一些关键的细节

代码实现在 `packages/reactive`

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

这里只考虑了常规数据结构，对 `Map` 和 `Set` 进行响应式处理比较复杂，暂不支持


## 100 行实现一个迷你前端框架 x-framework

框架实现在 `packages/x-framework`

测试代码在 `demo`

实现一个最小版本的 MVVM 框架，展示响应式系统的应用场景

### 目标

- 类 vue API
- 支持 `v-on`, `v-show`, `v-bind`, `v-model` 等核心指令
- 支持 watch, computed 机制
- 支持扩展 directive

简单起见，不实现

- vdom 及模板引擎
- 组件机制
- `v-for` 及 `v-if` 等与 vdom 关系密切的功能

### 运行测试应用

```bash

npm run dev:demo

```
