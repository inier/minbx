"use strict"

const mobx = require("../src")
const m = mobx
const { $mobx, observable, computed, autorun, decorate } = mobx

const voidObserver = function() {}

function buffer() {
    const b = []
    const res = function(x) {
        if (typeof x.newValue === "object") {
            const copy = { ...x.newValue }
            delete copy[$mobx]
            b.push(copy)
        } else {
            b.push(x.newValue)
        }
    }
    res.toArray = function() {
        return b
    }
    return res
}

test("argumentless observable", () => {
    const a = observable.box()

    expect(m.isObservable(a)).toBe(true)
    expect(a.get()).toBe(undefined)
})

test("basic", function() {
    const x = observable.box(3)
    const b = buffer()
    m.observe(x, b)
    expect(3).toBe(x.get())

    x.set(5)
    expect(5).toBe(x.get())
    expect([5]).toEqual(b.toArray())
    expect(mobx._isComputingDerivation()).toBe(false)
})

// test("basic2", function() {
//     const x = observable.box(3)
//     const z = computed(function() {
//         return x.get() * 2
//     })
//     const y = computed(function() {
//         return x.get() * 3
//     })

//     m.observe(z, voidObserver)

//     expect(z.get()).toBe(6)
//     expect(y.get()).toBe(9)

//     x.set(5)
//     expect(z.get()).toBe(10)
//     expect(y.get()).toBe(15)

//     expect(mobx._isComputingDerivation()).toBe(false)
// })

// test("dynamic", function(done) {
//     try {
//         const x = observable.box(3)
//         const y = m.computed(function() {
//             return x.get()
//         })
//         const b = buffer()
//         m.observe(y, b, true)

//         expect(3).toBe(y.get()) // First evaluation here..

//         x.set(5)
//         expect(5).toBe(y.get())

//         expect(b.toArray()).toEqual([3, 5])
//         expect(mobx._isComputingDerivation()).toBe(false)

//         done()
//     } catch (e) {
//         console.log(e.stack)
//     }
// })

// test("dynamic2", function(done) {
//     try {
//         const x = observable.box(3)
//         const y = computed(function() {
//             return x.get() * x.get()
//         })

//         expect(9).toBe(y.get())
//         const b = buffer()
//         m.observe(y, b)

//         x.set(5)
//         expect(25).toBe(y.get())

//         //no intermediate value 15!
//         expect([25]).toEqual(b.toArray())
//         expect(mobx._isComputingDerivation()).toBe(false)

//         done()
//     } catch (e) {
//         console.log(e.stack)
//     }
// })

test("box uses equals", function(done) {
    try {
        const x = observable.box("a", {
            equals: (oldValue, newValue) => {
                return oldValue.toLowerCase() === newValue.toLowerCase()
            }
        })

        const b = buffer()
        m.observe(x, b)

        x.set("A")
        x.set("b")
        x.set("B")
        x.set("C")

        expect(["b", "C"]).toEqual(b.toArray())
        expect(mobx._isComputingDerivation()).toBe(false)

        done()
    } catch (e) {
        console.log(e.stack)
    }
})

// test("box uses equals2", function(done) {
//     try {
//         const x = observable.box("01", {
//             equals: (oldValue, newValue) => {
//                 return parseInt(oldValue) === parseInt(newValue)
//             }
//         })

//         const y = computed(function() {
//             return parseInt(x)
//         })

//         const b = buffer()
//         m.observe(y, b)

//         x.set("2")
//         x.set("02")
//         x.set("002")
//         x.set("03")

//         expect([2, 3]).toEqual(b.toArray())
//         expect(mobx._isComputingDerivation()).toBe(false)

//         done()
//     } catch (e) {
//         console.log(e.stack)
//     }
// })

// test("readme1", function(done) {
//     try {
//         const b = buffer()

//         const vat = observable.box(0.2)
//         const order = {}
//         order.price = observable.box(10)
//         // Prints: New price: 24
//         // in TS, just: value(() => this.price() * (1+vat()))
//         order.priceWithVat = computed(function() {
//             return order.price.get() * (1 + vat.get())
//         })

//         m.observe(order.priceWithVat, b)

//         order.price.set(20)
//         expect([24]).toEqual(b.toArray())
//         order.price.set(10)
//         expect([24, 12]).toEqual(b.toArray())
//         expect(mobx._isComputingDerivation()).toBe(false)

//         done()
//     } catch (e) {
//         console.log(e.stack)
//         throw e
//     }
// })

// test("scope", function() {
//     const vat = observable.box(0.2)
//     const Order = function() {
//         this.price = observable.box(20)
//         this.amount = observable.box(2)
//         this.total = computed(
//             function() {
//                 return (1 + vat.get()) * this.price.get() * this.amount.get()
//             },
//             { context: this }
//         )
//     }

//     const order = new Order()
//     m.observe(order.total, voidObserver)
//     order.price.set(10)
//     order.amount.set(3)
//     expect(36).toBe(order.total.get())
//     expect(mobx._isComputingDerivation()).toBe(false)
// })

test("mobx.observe", function() {
    const events = []
    const o = observable({ b: 2 })
    const ar = observable([3])
    const map = mobx.observable.map({})

    const push = function(event) {
        events.push(event)
    }

    const stop2 = mobx.observe(o, push)
    const stop3 = mobx.observe(ar, push)
    const stop4 = mobx.observe(map, push)

    o.b = 5
    ar[0] = 6
    map.set("d", 7)

    stop2()
    stop3()
    stop4()

    o.b = 9
    ar[0] = 10
    map.set("d", 11)

    expect(events).toEqual([
        {
            type: "update",
            object: o,
            name: "b",
            newValue: 5,
            oldValue: 2
        },
        {
            object: ar,
            type: "update",
            index: 0,
            newValue: 6,
            oldValue: 3
        },
        {
            type: "add",
            object: map,
            newValue: 7,
            name: "d"
        }
    ])
})

// test("change count optimization", function() {
//     let bCalcs = 0
//     let cCalcs = 0
//     const a = observable.box(3)
//     const b = computed(function() {
//         bCalcs += 1
//         return 4 + a.get() - a.get()
//     })
//     const c = computed(function() {
//         cCalcs += 1
//         return b.get()
//     })

//     m.observe(c, voidObserver)

//     expect(b.get()).toBe(4)
//     expect(c.get()).toBe(4)
//     expect(bCalcs).toBe(1)
//     expect(cCalcs).toBe(1)

//     a.set(5)

//     expect(b.get()).toBe(4)
//     expect(c.get()).toBe(4)
//     expect(bCalcs).toBe(2)
//     expect(cCalcs).toBe(1)

//     expect(mobx._isComputingDerivation()).toBe(false)
// })

// test("observables removed", function() {
//     let calcs = 0
//     const a = observable.box(1)
//     const b = observable.box(2)
//     const c = computed(function() {
//         calcs++
//         if (a.get() === 1) return b.get() * a.get() * b.get()
//         return 3
//     })

//     expect(calcs).toBe(0)
//     m.observe(c, voidObserver)
//     expect(c.get()).toBe(4)
//     expect(calcs).toBe(1)
//     a.set(2)
//     expect(c.get()).toBe(3)
//     expect(calcs).toBe(2)

//     b.set(3) // should not retrigger calc
//     expect(c.get()).toBe(3)
//     expect(calcs).toBe(2)

//     a.set(1)
//     expect(c.get()).toBe(9)
//     expect(calcs).toBe(3)

//     expect(mobx._isComputingDerivation()).toBe(false)
// })

// test("lazy evaluation", function() {
//     let bCalcs = 0
//     let cCalcs = 0
//     let dCalcs = 0
//     let observerChanges = 0

//     const a = observable.box(1)
//     const b = computed(function() {
//         bCalcs += 1
//         return a.get() + 1
//     })

//     const c = computed(function() {
//         cCalcs += 1
//         return b.get() + 1
//     })

//     expect(bCalcs).toBe(0)
//     expect(cCalcs).toBe(0)
//     expect(c.get()).toBe(3)
//     expect(bCalcs).toBe(1)
//     expect(cCalcs).toBe(1)

//     expect(c.get()).toBe(3)
//     expect(bCalcs).toBe(2)
//     expect(cCalcs).toBe(2)

//     a.set(2)
//     expect(bCalcs).toBe(2)
//     expect(cCalcs).toBe(2)

//     expect(c.get()).toBe(4)
//     expect(bCalcs).toBe(3)
//     expect(cCalcs).toBe(3)

//     const d = computed(function() {
//         dCalcs += 1
//         return b.get() * 2
//     })

//     const handle = m.observe(
//         d,
//         function() {
//             observerChanges += 1
//         },
//         false
//     )
//     expect(bCalcs).toBe(4)
//     expect(cCalcs).toBe(3)
//     expect(dCalcs).toBe(1) // d is evaluated, so that its dependencies are known

//     a.set(3)
//     expect(d.get()).toBe(8)
//     expect(bCalcs).toBe(5)
//     expect(cCalcs).toBe(3)
//     expect(dCalcs).toBe(2)

//     expect(c.get()).toBe(5)
//     expect(bCalcs).toBe(5)
//     expect(cCalcs).toBe(4)
//     expect(dCalcs).toBe(2)

//     expect(b.get()).toBe(4)
//     expect(bCalcs).toBe(5)
//     expect(cCalcs).toBe(4)
//     expect(dCalcs).toBe(2)

//     handle() // unlisten
//     expect(d.get()).toBe(8)
//     expect(bCalcs).toBe(6) // gone to sleep
//     expect(cCalcs).toBe(4)
//     expect(dCalcs).toBe(3)

//     expect(observerChanges).toBe(1)

//     expect(mobx._isComputingDerivation()).toBe(false)
// })

// test("multiple view dependencies", function() {
//     let bCalcs = 0
//     let dCalcs = 0
//     const a = observable.box(1)
//     const b = computed(function() {
//         bCalcs++
//         return 2 * a.get()
//     })
//     const c = observable.box(2)
//     const d = computed(function() {
//         dCalcs++
//         return 3 * c.get()
//     })

//     let zwitch = true
//     const buffer = []
//     let fCalcs = 0
//     const dis = mobx.autorun(function() {
//         fCalcs++
//         if (zwitch) buffer.push(b.get() + d.get())
//         else buffer.push(d.get() + b.get())
//     })

//     zwitch = false
//     c.set(3)
//     expect(bCalcs).toBe(1)
//     expect(dCalcs).toBe(2)
//     expect(fCalcs).toBe(2)
//     expect(buffer).toEqual([8, 11])

//     c.set(4)
//     expect(bCalcs).toBe(1)
//     expect(dCalcs).toBe(3)
//     expect(fCalcs).toBe(3)
//     expect(buffer).toEqual([8, 11, 14])

//     dis()
//     c.set(5)
//     expect(bCalcs).toBe(1)
//     expect(dCalcs).toBe(3)
//     expect(fCalcs).toBe(3)
//     expect(buffer).toEqual([8, 11, 14])
// })

// test("nested observable2", function() {
//     const factor = observable.box(0)
//     const price = observable.box(100)
//     let totalCalcs = 0
//     let innerCalcs = 0

//     const total = computed(function() {
//         totalCalcs += 1 // outer observable shouldn't recalc if inner observable didn't publish a real change
//         return (
//             price.get() *
//             computed(function() {
//                 innerCalcs += 1
//                 return factor.get() % 2 === 0 ? 1 : 3
//             }).get()
//         )
//     })

//     const b = []
//     m.observe(
//         total,
//         function(x) {
//             b.push(x.newValue)
//         },
//         true
//     )

//     price.set(150)
//     factor.set(7) // triggers innerCalc twice, because changing the outcome triggers the outer calculation which recreates the inner calculation
//     factor.set(5) // doesn't trigger outer calc
//     factor.set(3) // doesn't trigger outer calc
//     factor.set(4) // triggers innerCalc twice
//     price.set(20)

//     expect(b).toEqual([100, 150, 450, 150, 20])
//     expect(innerCalcs).toBe(9)
//     expect(totalCalcs).toBe(5)
// })

// test("observe", function() {
//     const x = observable.box(3)
//     const x2 = computed(function() {
//         return x.get() * 2
//     })
//     const b = []

//     const cancel = mobx.autorun(function() {
//         b.push(x2.get())
//     })

//     x.set(4)
//     x.set(5)
//     expect(b).toEqual([6, 8, 10])
//     cancel()
//     x.set(7)
//     expect(b).toEqual([6, 8, 10])
// })

test("when", function() {
    const x = observable.box(3)

    let called = 0
    mobx.when(
        function() {
            return x.get() === 4
        },
        function() {
            called += 1
        }
    )

    x.set(5)
    expect(called).toBe(0)
    x.set(4)
    expect(called).toBe(1)
    x.set(3)
    expect(called).toBe(1)
    x.set(4)
    expect(called).toBe(1)
})

test("when 2", function() {
    const x = observable.box(3)

    let called = 0
    const d = mobx.when(
        function() {
            return x.get() === 3
        },
        function() {
            called += 1
        },
        { name: "when x is 3" }
    )

    expect(called).toBe(1)
    expect(x.observers.size).toBe(0)
    x.set(5)
    x.set(3)
    expect(called).toBe(1)

    expect(d[$mobx].name).toBe("when x is 3")
})

function stripSpyOutput(events) {
    events.forEach(ev => {
        delete ev.time
        delete ev.fn
        delete ev.object
    })
    return events
}

test("computed values believe NaN === NaN", function() {
    const a = observable.box(2)
    const b = observable.box(3)
    const c = computed(function() {
        return String(a.get() * b.get())
    })
    const buf = buffer()
    m.observe(c, buf)

    a.set(NaN)
    b.set(NaN)
    a.set(NaN)
    a.set(2)
    b.set(3)

    expect(buf.toArray()).toEqual(["NaN", "6"])
})

test("computed values believe deep NaN === deep NaN when using compareStructural", function() {
    const a = observable({ b: { a: 1 } })
    const c = computed(
        function() {
            return a.b
        },
        { compareStructural: true }
    )

    const buf = new buffer()
    c.observe(newValue => {
        buf(newValue)
    })

    a.b = { a: NaN }
    a.b = { a: NaN }
    a.b = { a: NaN }
    a.b = { a: 2 }
    a.b = { a: NaN }

    const bufArray = buf.toArray()
    expect(isNaN(bufArray[0].b)).toBe(true)
    expect(bufArray[1]).toEqual({ a: 2 })
    expect(isNaN(bufArray[2].b)).toEqual(true)
    expect(bufArray.length).toBe(3)
})

test("autoruns created in autoruns should kick off", function() {
    const x = observable.box(3)
    const x2 = []
    let d

    const a = m.autorun(function() {
        if (d) {
            // dispose previous autorun
            d()
        }
        d = m.autorun(function() {
            x2.push(x.get() * 2)
        })
    })

    // a should be observed by the inner autorun, not the outer
    expect(a[$mobx].observing.length).toBe(0)
    expect(d[$mobx].observing.length).toBe(1)

    x.set(4)
    expect(x2).toEqual([6, 8])
})

test("#328 atom throwing exception if observing stuff in onObserved", () => {
    const b = mobx.observable.box(1)
    const a = mobx.createAtom("test atom", () => {
        b.get()
    })
    const d = mobx.autorun(() => {
        a.reportObserved() // threw
    })
    d()
})

test("prematurely ended autoruns are cleaned up properly", () => {
    const a = mobx.observable.box(1)
    const b = mobx.observable.box(2)
    const c = mobx.observable.box(3)
    let called = 0

    const d = mobx.autorun(() => {
        called++
        if (a.get() === 2) {
            d() // dispose
            b.get() // consume
            a.set(3) // cause itself to re-run, but, disposed!
        } else {
            c.get()
        }
    })

    expect(called).toBe(1)
    expect(a.observers.size).toBe(1)
    expect(b.observers.size).toBe(0)
    expect(c.observers.size).toBe(1)
    expect(d[$mobx].observing.length).toBe(2)

    a.set(2)

    expect(called).toBe(2)
    expect(a.observers.size).toBe(0)
    expect(b.observers.size).toBe(0)
    expect(c.observers.size).toBe(0)
    expect(d[$mobx].observing.length).toBe(0)
})

test("unoptimizable subscriptions are diffed correctly", () => {
    const a = mobx.observable.box(1)
    const b = mobx.observable.box(1)
    const c = mobx.computed(() => {
        a.get()
        return 3
    })
    let called = 0
    let val = 0

    const d = mobx.autorun(() => {
        called++
        a.get()
        c.get() // reads a as well
        val = a.get()
        if (
            b.get() === 1 // only on first run
        )
            a.get() // second run: one read less for a
    })

    expect(called).toBe(1)
    expect(val).toBe(1)
    expect(a.observers.size).toBe(2)
    expect(b.observers.size).toBe(1)
    expect(c.observers.size).toBe(1)
    expect(d[$mobx].observing.length).toBe(3) // 3 would be better!

    b.set(2)

    expect(called).toBe(2)
    expect(val).toBe(1)
    expect(a.observers.size).toBe(2)
    expect(b.observers.size).toBe(1)
    expect(c.observers.size).toBe(1)
    expect(d[$mobx].observing.length).toBe(3) // c was cached so accessing a was optimizable

    a.set(2)

    expect(called).toBe(3)
    expect(val).toBe(2)
    expect(a.observers.size).toBe(2)
    expect(b.observers.size).toBe(1)
    expect(c.observers.size).toBe(1)
    expect(d[$mobx].observing.length).toBe(3) // c was cached so accessing a was optimizable

    d()
})

test("atom events #427", () => {
    let start = 0
    let stop = 0
    let runs = 0

    const a = mobx.createAtom("test", () => start++, () => stop++)
    expect(a.reportObserved()).toEqual(false)

    expect(start).toBe(0)
    expect(stop).toBe(0)

    let d = mobx.autorun(() => {
        runs++
        expect(a.reportObserved()).toBe(true)
        expect(start).toBe(1)
        expect(a.reportObserved()).toBe(true)
        expect(start).toBe(1)
    })

    expect(runs).toBe(1)
    expect(start).toBe(1)
    expect(stop).toBe(0)
    a.reportChanged()
    expect(runs).toBe(2)
    expect(start).toBe(1)
    expect(stop).toBe(0)

    d()
    expect(runs).toBe(2)
    expect(start).toBe(1)
    expect(stop).toBe(1)

    expect(a.reportObserved()).toBe(false)
    expect(start).toBe(1)
    expect(stop).toBe(1)

    d = mobx.autorun(() => {
        expect(a.reportObserved()).toBe(true)
        expect(start).toBe(2)
        a.reportObserved()
        expect(start).toBe(2)
    })

    expect(start).toBe(2)
    expect(stop).toBe(1)
    a.reportChanged()
    expect(start).toBe(2)
    expect(stop).toBe(1)

    d()
    expect(stop).toBe(2)
})

test("computed getter / setter for plan objects should succeed", function() {
    const b = observable({
        a: 3,
        get propX() {
            return this.a * 2
        },
        set propX(v) {
            this.a = v
        }
    })

    const values = []
    mobx.autorun(function() {
        return values.push(b.propX)
    })
    expect(b.propX).toBe(6)
    b.propX = 4
    expect(b.propX).toBe(8)

    expect(values).toEqual([6, 8])
})

test("helpful error for self referencing setter", function() {
    const a = observable({
        x: 1,
        get y() {
            return this.x
        },
        set y(v) {
            this.y = v // woops...;-)
        }
    })

    expect(() => (a.y = 2)).toThrowError(/The setter of computed value/)
})

test("#558 boxed observables stay boxed observables", function() {
    const a = observable({
        x: observable.box(3)
    })

    expect(typeof a.x).toBe("object")
    expect(typeof a.x.get).toBe("function")
})

test("iscomputed", function() {
    expect(mobx.isComputed(observable.box(3))).toBe(false)
    expect(
        mobx.isComputed(
            mobx.computed(function() {
                return 3
            })
        )
    ).toBe(true)

    const x = observable({
        a: 3,
        get b() {
            return this.a
        }
    })

    expect(mobx.isComputedProp(x, "a")).toBe(false)
    expect(mobx.isComputedProp(x, "b")).toBe(true)
})

test("#561 test toPrimitive() of observable objects", function() {
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive) {
        let x = observable.box(3)

        expect(x.valueOf()).toBe(3)
        expect(x[Symbol.toPrimitive]()).toBe(3)

        expect(+x).toBe(3)
        expect(++x).toBe(4)

        const y = observable.box(3)

        expect(y + 7).toBe(10)

        const z = computed(() => ({ a: 3 }))
        expect(3 + z).toBe("3[object Object]")
    } else {
        let x = observable.box(3)

        expect(x.valueOf()).toBe(3)
        expect(x["@@toPrimitive"]()).toBe(3)

        expect(+x).toBe(3)
        expect(++x).toBe(4)

        const y = observable.box(3)

        expect(y + 7).toBe(10)

        const z = computed(() => ({ a: 3 }))
        expect("3" + z["@@toPrimitive"]()).toBe("3[object Object]")
    }
})

test("Issue 1120 - isComputed should return false for a non existing property", () => {
    expect(mobx.isComputedProp({}, "x")).toBe(false)
    expect(mobx.isComputedProp(observable({}), "x")).toBe(false)
})

test("computed comparer works with decorate (plain)", () => {
    const sameTime = (from, to) => from.hour === to.hour && from.minute === to.minute
    function Time(hour, minute) {
        this.hour = hour
        this.minute = minute
    }

    Object.defineProperty(Time.prototype, "time", {
        configurable: true,
        enumerable: true,
        get() {
            return { hour: this.hour, minute: this.minute }
        }
    })
    decorate(Time, {
        hour: observable,
        minute: observable,
        time: computed({ equals: sameTime })
    })
    const time = new Time(9, 0)

    const changes = []
    const disposeAutorun = autorun(() => changes.push(time.time))

    expect(changes).toEqual([{ hour: 9, minute: 0 }])
    time.hour = 9
    expect(changes).toEqual([{ hour: 9, minute: 0 }])
    time.minute = 0
    expect(changes).toEqual([{ hour: 9, minute: 0 }])
    time.hour = 10
    expect(changes).toEqual([{ hour: 9, minute: 0 }, { hour: 10, minute: 0 }])
    time.minute = 30
    expect(changes).toEqual([
        { hour: 9, minute: 0 },
        { hour: 10, minute: 0 },
        { hour: 10, minute: 30 }
    ])

    disposeAutorun()
})

test("computed comparer works with decorate (plain) - 3", () => {
    const sameTime = (from, to) => from.hour === to.hour && from.minute === to.minute
    const time = observable.object(
        {
            hour: 9,
            minute: 0,
            get time() {
                return { hour: this.hour, minute: this.minute }
            }
        },
        {
            time: computed({ equals: sameTime })
        }
    )

    const changes = []
    const disposeAutorun = autorun(() => changes.push(time.time))

    expect(changes).toEqual([{ hour: 9, minute: 0 }])
    time.hour = 9
    expect(changes).toEqual([{ hour: 9, minute: 0 }])
    time.minute = 0
    expect(changes).toEqual([{ hour: 9, minute: 0 }])
    time.hour = 10
    expect(changes).toEqual([{ hour: 9, minute: 0 }, { hour: 10, minute: 0 }])
    time.minute = 30
    expect(changes).toEqual([
        { hour: 9, minute: 0 },
        { hour: 10, minute: 0 },
        { hour: 10, minute: 30 }
    ])

    disposeAutorun()
})

test("can create computed with setter", () => {
    let y = 1
    let x = mobx.computed(
        () => y,
        v => {
            y = v * 2
        }
    )
    expect(x.get()).toBe(1)
    x.set(3)
    expect(x.get()).toBe(6)
})

test("can make non-extenible objects observable", () => {
    const base = { x: 3 }
    Object.freeze(base)
    const o = mobx.observable(base)
    o.x = 4
    expect(o.x).toBe(4)
    expect(mobx.isObservableProp(o, "x")).toBeTruthy()
})

test("keeping computed properties alive does not run before access", () => {
    let calcs = 0
    observable(
        {
            x: 1,
            get y() {
                calcs++
                return this.x * 2
            }
        },
        {
            y: mobx.computed({ keepAlive: true })
        }
    )

    expect(calcs).toBe(0) // initially there is no calculation done
})

test("(for objects) keeping computed properties alive does not run before access", () => {
    let calcs = 0
    class Foo {
        @observable x = 1
        @computed({ keepAlive: true })
        get y() {
            calcs++
            return this.x * 2
        }
    }
    new Foo()

    expect(calcs).toBe(0) // initially there is no calculation done
})

test("keeping computed properties alive runs on first access", () => {
    let calcs = 0
    const x = observable(
        {
            x: 1,
            get y() {
                calcs++
                return this.x * 2
            }
        },
        {
            y: mobx.computed({ keepAlive: true })
        }
    )

    expect(calcs).toBe(0)
    expect(x.y).toBe(2) // perform calculation on access
    expect(calcs).toBe(1)
})

test("keeping computed properties alive caches values on subsequent accesses", () => {
    let calcs = 0
    const x = observable(
        {
            x: 1,
            get y() {
                calcs++
                return this.x * 2
            }
        },
        {
            y: mobx.computed({ keepAlive: true })
        }
    )

    expect(x.y).toBe(2) // first access: do calculation
    expect(x.y).toBe(2) // second access: use cached value, no calculation
    expect(calcs).toBe(1) // only one calculation: cached!
})

test("keeping computed properties alive does not recalculate when dirty", () => {
    let calcs = 0
    const x = observable(
        {
            x: 1,
            get y() {
                calcs++
                return this.x * 2
            }
        },
        {
            y: mobx.computed({ keepAlive: true })
        }
    )

    expect(x.y).toBe(2) // first access: do calculation
    expect(calcs).toBe(1)
    x.x = 3 // mark as dirty: no calculation
    expect(calcs).toBe(1)
    expect(x.y).toBe(6)
})

test("keeping computed properties alive recalculates when accessing it dirty", () => {
    let calcs = 0
    const x = observable(
        {
            x: 1,
            get y() {
                calcs++
                return this.x * 2
            }
        },
        {
            y: mobx.computed({ keepAlive: true })
        }
    )

    expect(x.y).toBe(2) // first access: do calculation
    expect(calcs).toBe(1)
    x.x = 3 // mark as dirty: no calculation
    expect(calcs).toBe(1)
    expect(x.y).toBe(6) // second access: do calculation because it is dirty
    expect(calcs).toBe(2)
})

test("(for objects) keeping computed properties alive recalculates when accessing it dirty", () => {
    let calcs = 0
    class Foo {
        @observable x = 1
        @computed({ keepAlive: true })
        get y() {
            calcs++
            return this.x * 2
        }
    }
    const x = new Foo()

    expect(x.y).toBe(2) // first access: do calculation
    expect(calcs).toBe(1)
    x.x = 3 // mark as dirty: no calculation
    expect(calcs).toBe(1)
    expect(x.y).toBe(6) // second access: do calculation because it is dirty
    expect(calcs).toBe(2)
})
