import { observable } from './src';

const a = observable({ a: 1, b: { c: 2, e: [5, 7] }, d: [1, 4, 5] });
// const a = observable({ a: 1 });
window.aaa = a;
console.log(a);
// console.log(a.a, a.b.c);
// a.a = 3;

// a.d.length = 8;
console.log(a.d[7]);
