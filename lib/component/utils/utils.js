"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.levenshtein = exports.cacheInstances = exports.addLevenshtein = exports.makeIterable = exports.nativeIterator = void 0;
const fastest_levenshtein = require("fastest-levenshtein");
const console = require("./console");

/** @internal */
function* nativeIterator(holder, nativeFunction, Class) {
    const iterator = Memory.alloc(Process.pointerSize);
    let handle;
    while (!(handle = nativeFunction(holder, iterator)).isNull()) {
        yield new Class(handle);
    }
}

exports.nativeIterator = nativeIterator;

/** @internal */
function makeIterable(source) {
    Reflect.set(source, Symbol.iterator, function* () {
        for (const value of Object.values(source)) {
            yield value;
        }
    });
    return source;
}

exports.makeIterable = makeIterable;

/** @internal */
function addLevenshtein(object) {
    return new Proxy(object, {
        get(target, key) {
            if (typeof key != "string" || key in target) {
                return Reflect.get(target, key);
            }
            const closestMatch = fastest_levenshtein.closest(key, Object.keys(target));
            if (closestMatch) {
                throw new Error(`Couldn't find property "${key}", did you mean "${closestMatch}"?`);
            } else {
                throw new Error(`Couldn't find property "${key}".`);
            }
        }
    });
}

exports.addLevenshtein = addLevenshtein;

/** @internal */
function cacheInstances(Class) {
    const instanceCache = new Map();
    return new Proxy(Class, {
        construct(Target, argArray) {
            const handle = argArray[0].toUInt32();
            if (!instanceCache.has(handle)) {
                instanceCache.set(handle, new Target(argArray[0]));
            }
            return instanceCache.get(handle);
        }
    });
}

exports.cacheInstances = cacheInstances;

/** @internal */
function levenshtein(candidatesKey, nameGetter = e => e.name) {
    return function (_, propertyKey, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (key, ...args) {
            const result = original.call(this, key, ...args);
            if (result != null)
                return result;
            const closestMatch = fastest_levenshtein.closest(key, this[candidatesKey].map(nameGetter));
            console.raise(`couldn't find ${propertyKey} ${key} in ${this.name}${closestMatch ? `, did you mean ${closestMatch}?` : ``}`);
        };
    };
}

exports.levenshtein = levenshtein;
