"use strict"

const mobx = require("../src")
const { observable, when, reaction } = mobx

test("test1", function() {
    const a = observable.array([])
    expect(a.length).toBe(0)
    expect(Object.keys(a)).toEqual([])
    expect(a.slice()).toEqual([])

    a.push(1)
    expect(a.length).toBe(1)
    expect(a.slice()).toEqual([1])

    a[1] = 2
    expect(a.length).toBe(2)
    expect(a.slice()).toEqual([1, 2])

    // const sum = mobx.computed(function() {
    //     return (
    //         -1 +
    //         a.reduce(function(a, b) {
    //             return a + b
    //         }, 1)
    //     )
    // })

    // expect(sum.get()).toBe(3)

    // a[1] = 3
    // expect(a.length).toBe(2)
    // expect(a.slice()).toEqual([1, 3])
    // expect(sum.get()).toBe(4)

    // a.splice(1, 1, 4, 5)
    // expect(a.length).toBe(3)
    // expect(a.slice()).toEqual([1, 4, 5])
    // expect(sum.get()).toBe(10)

    // a.replace([2, 4])
    // expect(sum.get()).toBe(6)

    // a.splice(1, 1)
    // expect(sum.get()).toBe(2)
    // expect(a.slice()).toEqual([2])

    // a.spliceWithArray(0, 0, [4, 3])
    // expect(sum.get()).toBe(9)
    // expect(a.slice()).toEqual([4, 3, 2])

    // a.clear()
    // expect(sum.get()).toBe(0)
    // expect(a.slice()).toEqual([])

    // a.length = 4
    // expect(isNaN(sum.get())).toBe(true)
    // expect(a.length).toEqual(4)

    // expect(a.slice()).toEqual([undefined, undefined, undefined, undefined])

    // a.replace([1, 2, 2, 4])
    // expect(sum.get()).toBe(9)
    // a.length = 4
    // expect(sum.get()).toBe(9)

    // a.length = 2
    // expect(sum.get()).toBe(3)
    // expect(a.slice()).toEqual([1, 2])

    // expect(a.slice().reverse()).toEqual([2, 1])
    // expect(a.slice()).toEqual([1, 2])

    // a.unshift(3)
    // expect(a.slice().sort()).toEqual([1, 2, 3])
    // expect(a.slice()).toEqual([3, 1, 2])

    // expect(JSON.stringify(a)).toBe("[3,1,2]")

    // expect(a.get(1)).toBe(1)
    // a.set(2, 4)
    // expect(a.get(2)).toBe(4)

    // expect(Object.keys(a)).toEqual(["0", "1", "2"]) // ideally....
})

test("find(findIndex) and remove", function() {
    const a = mobx.observable([10, 20, 20])
    let idx = -1
    function predicate(item, index) {
        if (item === 20) {
            idx = index
            return true
        }
        return false
    }
    ;[].findIndex
    expect(a.find(predicate)).toBe(20)
    expect(a.findIndex(predicate)).toBe(1)
    expect(a.find(predicate)).toBe(20)
})

test("concat should automatically slice observable arrays, #260", () => {
    const a1 = mobx.observable([1, 2])
    const a2 = mobx.observable([3, 4])
    expect(a1.concat(a2)).toEqual([1, 2, 3, 4])
})

test("array modification1", function() {
    const a = mobx.observable([1, 2, 3])
    const r = a.splice(-10, 5, 4, 5, 6)
    expect(a.slice()).toEqual([4, 5, 6])
    expect(r).toEqual([1, 2, 3])
})

test("serialize", function() {
    let a = [1, 2, 3]
    const m = mobx.observable(a)

    expect(JSON.stringify(m)).toEqual(JSON.stringify(a))

    expect(a).toEqual(m.slice())

    a = [4]
    m.replace(a)
    expect(JSON.stringify(m)).toEqual(JSON.stringify(a))
    expect(a).toEqual(m.toJSON())
})

test("array modification functions", function() {
    const ars = [[], [1, 2, 3]]
    const funcs = ["push", "pop", "shift", "unshift"]
    funcs.forEach(function(f) {
        ars.forEach(function(ar) {
            const a = ar.slice()
            const b = mobx.observable(a)
            const res1 = a[f](4)
            const res2 = b[f](4)
            expect(res1).toEqual(res2)
            expect(a).toEqual(b.slice())
        })
    })
})

test("array modifications", function() {
    const a2 = mobx.observable([])
    const inputs = [undefined, -10, -4, -3, -1, 0, 1, 3, 4, 10]
    const arrays = [
        [],
        [1],
        [1, 2, 3, 4],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        [1, undefined],
        [undefined]
    ]
    for (let i = 0; i < inputs.length; i++)
        for (let j = 0; j < inputs.length; j++)
            for (let k = 0; k < arrays.length; k++)
                for (let l = 0; l < arrays.length; l++) {
                    ;[
                        "array mod: [",
                        arrays[k].toString(),
                        "] i: ",
                        inputs[i],
                        " d: ",
                        inputs[j],
                        " [",
                        arrays[l].toString(),
                        "]"
                    ].join(" ")
                    const a1 = arrays[k].slice()
                    a2.replace(a1)
                    const res1 = a1.splice.apply(a1, [inputs[i], inputs[j]].concat(arrays[l]))
                    const res2 = a2.splice.apply(a2, [inputs[i], inputs[j]].concat(arrays[l]))
                    expect(a1.slice()).toEqual(a2.slice())
                    expect(res1).toEqual(res2)
                    expect(a1.length).toBe(a2.length)
                }
})

test("is array", function() {
    const x = mobx.observable([])
    expect(x instanceof Array).toBe(true)

    // would be cool if this would return true...
    expect(Array.isArray(x)).toBe(true)
})

test("stringifies same as ecma array", function() {
    const x = mobx.observable([])
    expect(x instanceof Array).toBe(true)

    // would be cool if these two would return true...
    expect(x.toString()).toBe("")
    expect(x.toLocaleString()).toBe("")
    x.push(1, 2)
    expect(x.toString()).toBe("1,2")
    expect(x.toLocaleString()).toBe("1,2")
})

// test("observes when stringified", function() {
//     const x = mobx.observable([])
//     let c = 0
//     mobx.autorun(function() {
//         x.toString()
//         c++
//     })
//     x.push(1)
//     expect(c).toBe(2)
// })

// test("observes when stringified to locale", function() {
//     const x = mobx.observable([])
//     let c = 0
//     mobx.autorun(function() {
//         x.toLocaleString()
//         c++
//     })
//     x.push(1)
//     expect(c).toBe(2)
// })

// test("react to sort changes", function() {
//     const x = mobx.observable([4, 2, 3])
//     const sortedX = mobx.computed(function() {
//         return x.slice().sort()
//     })
//     let sorted

//     mobx.autorun(function() {
//         sorted = sortedX.get()
//     })

//     expect(x.slice()).toEqual([4, 2, 3])
//     expect(sorted).toEqual([2, 3, 4])
//     x.push(1)
//     expect(x.slice()).toEqual([4, 2, 3, 1])
//     expect(sorted).toEqual([1, 2, 3, 4])
//     x.shift()
//     expect(x.slice()).toEqual([2, 3, 1])
//     expect(sorted).toEqual([1, 2, 3])
// })

// test("autoextend buffer length", function() {
//     const ar = observable(new Array(1000))
//     let changesCount = 0
//     ar.observe(() => ++changesCount)

//     ar[ar.length] = 0
//     ar.push(0)

//     expect(changesCount).toBe(2)
// })

test("array exposes correct keys", () => {
    const keys = []
    const ar = observable([1, 2])
    for (const key in ar) keys.push(key)

    expect(keys).toEqual(["0", "1"])
})

// test("can iterate arrays", () => {
//     const x = mobx.observable([])
//     const y = []
//     const d = mobx.reaction(() => Array.from(x), items => y.push(items), { fireImmediately: true })

//     x.push("a")
//     x.push("b")
//     expect(y).toEqual([[], ["a"], ["a", "b"]])
//     d()
// })

test("array is concat spreadable, #1395", () => {
    const x = mobx.observable([1, 2, 3, 4])
    const y = [5].concat(x)
    expect(y.length).toBe(5)
    expect(y).toEqual([5, 1, 2, 3, 4])
})

test("array is spreadable, #1395", () => {
    const x = mobx.observable([1, 2, 3, 4])
    expect([5, ...x]).toEqual([5, 1, 2, 3, 4])

    const y = mobx.observable([])
    expect([5, ...y]).toEqual([5])
})

test("array supports toStringTag, #1490", () => {
    // N.B. on old environments this requires polyfils for these symbols *and* Object.prototype.toString.
    // core-js provides both
    const a = mobx.observable([])
    expect(Object.prototype.toString.call(a)).toBe("[object Array]")
})

test("slice works", () => {
    const a = mobx.observable([1, 2, 3])
    expect(a.slice(0, 2)).toEqual([1, 2])
})

// test("slice is reactive", () => {
//     const a = mobx.observable([1, 2, 3])
//     let ok = false
//     when(() => a.slice().length === 4, () => (ok = true))
//     expect(ok).toBe(false)
//     a.push(1)
//     expect(ok).toBe(true)
// })

test("toString", () => {
    expect(mobx.observable([1, 2]).toString()).toEqual([1, 2].toString())
    expect(mobx.observable([1, 2]).toLocaleString()).toEqual([1, 2].toLocaleString())
})

test("can define properties on arrays", () => {
    const ar = observable.array([1, 2])
    Object.defineProperty(ar, "toString", {
        enumerable: false,
        configurable: true,
        value: function() {
            return "hoi"
        }
    })

    expect(ar.toString()).toBe("hoi")
    expect("" + ar).toBe("hoi")
})

// test("#2044 symbol key on array", () => {
//     const x = observable([1, 2])
//     const s = Symbol("test")
//     x[s] = 3
//     expect(x[s]).toBe(3)

//     let reacted = false
//     const d = reaction(
//         () => x[s],
//         () => {
//             reacted = true
//         }
//     )

//     x[s] = 4
//     expect(x[s]).toBe(4)

//     // although x[s] can be stored, it won't be reactive!
//     expect(reacted).toBe(false)
//     d()
// })

// test("#2044 non-symbol key on array", () => {
//     const x = observable([1, 2])
//     const s = "test"
//     x[s] = 3
//     expect(x[s]).toBe(3)

//     let reacted = false
//     const d = reaction(
//         () => x[s],
//         () => {
//             reacted = true
//         }
//     )

//     x[s] = 4
//     expect(x[s]).toBe(4)

//     // although x[s] can be stored, it won't be reactive!
//     expect(reacted).toBe(false)
//     d()
// })

// test("reproduce #2021", () => {
//     expect.assertions(1)
//     try {
//         Array.prototype.extension = function() {
//             console.log("I'm the extension!", this.length)
//         }

//         class Test {
//             @observable
//             data = null
//         }

//         const test = new Test()

//         mobx.autorun(() => {
//             if (test.data) expect(test.data.someStr).toBe("123")
//         })

//         test.data = { someStr: "123" }
//     } finally {
//         delete Array.prototype.extension
//     }
// })
