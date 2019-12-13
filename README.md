# minbx

mini mobx: main part of mobx, for new learners who diving into the source code

## usage

same as using mobx

1. `yarn add minbx`

2. import

```js
import { observable, computed, autorun, set, get, has, $mobx } from 'minbx';

import { observer, Observer, useObserver } from 'minbx'; // for react-mobx
```

3. example

```js
class Store {
  @observable obj = { a: 1 };
  @observable arr = [2, 3];
  @observable str = 'hello';
  @observable bool = true;
  @observable num = 4;
  @computed get mixed() {
    return store.str + '/' + store.num;
  }
}

const store = new Store();

autorun(r => {
  console.log('auto', store.str, store.obj.a, store.dbl);
});

store.str = 'change';
```

## blog post

- [mobx 源码解读（一）：从零到 observable 一个 object 如何](https://github.com/lawler61/blog/blob/master/js/mobx-source/1.observable-an-object.md)

- [mobx 源码解读（二）：都 observe object 了，其他类型还会远吗](https://github.com/lawler61/blog/blob/master/js/mobx-source/2.observable-other-type.md)

- [mobx 源码解读（三）：mobx 中的依赖收集：订阅-发布模式](https://github.com/lawler61/blog/blob/master/js/mobx-source/3.collect-dependencies.md)

- [mobx 源码解读（四）：讲讲 autorun 和 reaction](https://github.com/lawler61/blog/blob/master/js/mobx-source/4.autorun.md)

- [mobx 源码解读（五）：如虎添翼的 mobx-react](https://github.com/lawler61/blog/blob/master/js/mobx-source/5.mobx-react.md)

## contribute

welcome to pr

**don't forget to star ❤️ ~**
