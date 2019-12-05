import { observable, computed, autorun } from './src';
import { observable as o, computed as c } from 'mobx';

// const a = observable({
//   a: 1,
//   b: 'str',
//   c: true,
//   d: null,
//   e: [2, 3, 4],
//   f: { g: false, h: 6 },
//   i: { j: 1, k: [6, 7, 8], l: { m: 'obj', n: undefined } },
//   o: [{ id: 1 }, { id: 2 }],
// });
// console.log(a);
// window.aa = a;

class Store {
  @observable obj = { p: '1', a: [4, 6] };
  @observable arr = [1, 4, 6];
  @observable str = 'hello';
  @observable bool = false;
  @observable num = 3;

  @computed get mixed() {
    return store.str + '/' + store.num;
    // return 12;
  }
}

const store = new Store();
// console.log(store.mixed);
window.ss = store;
// debugger;

autorun(rc => {
  if (!store.bool) {
    console.log('auto run:', store.str, store.arr);
  } else {
    // store.str = 'change-in';
    console.log(store.mixed);
    console.log('auto run2:', store.str, store.bool, store.obj, store.mixed);
  }
});

store.bool = true;
