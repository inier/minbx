# minbx

mini mobx：main part of mobx, for new learners who diving into the source code

## usage

same as using mobx

1. `yarn add minbx`

2. `import { observable, computed, autorun, set, get, has, $mobx } from 'minbx';`

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
  console.log('auto2', store.str, store.obj.a, store.dbl);
});

store.str = 'change';
```

## contribute

welcome to pr~
