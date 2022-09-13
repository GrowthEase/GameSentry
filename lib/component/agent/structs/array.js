"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", {value: true});
const decorator_cache_getter = require("decorator-cache-getter");
const regeneratorRuntime = require("regenerator-runtime");
const console = require("../../utils/console");
const native_struct = require("../../utils/native-struct");

/** Represents a `Il2CppArraySize`. */
class Il2CppArray extends native_struct.NativeStruct {
    /** @internal */
    static from(klass, lengthOrElements) {
        const length = typeof lengthOrElements == "number" ? lengthOrElements : lengthOrElements.length;
        const array = new Il2Cpp.Array(Il2Cpp.Api._arrayNew(klass, length));
        if (Array.isArray(lengthOrElements)) {
            array.elements.write(lengthOrElements);
        }
        return array;
    }

    /** @internal Gets a pointer to the first element of the current array. */
    get elements() {
        return new Il2Cpp.Pointer(Il2Cpp.Api._arrayGetElements(this), this.elementType);
    }

    /** Gets the size of the object encompassed by the current array. */
    get elementSize() {
        return this.elementType.class.arrayElementSize;
    }

    /** Gets the type of the object encompassed by the current array. */
    get elementType() {
        return this.object.class.type.class.baseType;
    }

    /** Gets the total number of elements in all the dimensions of the current array. */
    get length() {
        return Il2Cpp.Api._arrayGetLength(this);
    }

    /** Gets the encompassing object of the current array. */
    get object() {
        return new Il2Cpp.Object(this);
    }

    /** Gets the element at the specified index of the current array. */
    get(index) {
        if (index < 0 || index >= this.length) {
            console.raise(`cannot get element at index ${index}: array length is ${this.length}`);
        }
        return this.elements.get(index);
    }

    /** Sets the element at the specified index of the current array. */
    set(index, value) {
        if (index < 0 || index >= this.length) {
            console.raise(`cannot get element at index ${index}: array length is ${this.length}`);
        }
        this.elements.set(index, value);
    }

    /** */
    toString() {
        return this.isNull() ? "null" : `[${this.elements.read(this.length, 0)}]`;
    }

    /** Iterable. */
    * [Symbol.iterator]() {
        for (let i = 0; i < this.length; i++) {
            yield this.elements.get(i);
        }
    }
}

__decorate([
    decorator_cache_getter.cache
], Il2CppArray.prototype, "elements", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppArray.prototype, "elementSize", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppArray.prototype, "elementType", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppArray.prototype, "length", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppArray.prototype, "object", null);
Il2Cpp.Array = Il2CppArray;
