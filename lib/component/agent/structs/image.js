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
const native_struct = require("../../utils/native-struct");
const utils = require("../../utils/utils");
/** Represents a `Il2CppImage`. */
let Il2CppImage = class Il2CppImage extends native_struct.NonNullNativeStruct {
    /** Gets the COR library. */
    static get corlib() {
        return new Il2Cpp.Image(Il2Cpp.Api._getCorlib());
    }

    /** Gets the assembly in which the current image is defined. */
    get assembly() {
        return new Il2Cpp.Assembly(Il2Cpp.Api._imageGetAssembly(this));
    }

    /** Gets the amount of classes defined in this image. */
    get classCount() {
        return Il2Cpp.Api._imageGetClassCount(this);
    }

    /** Gets the classes defined in this image. */
    get classes() {
        if (Il2Cpp.unityVersionIsBelow201830) {
            const types = this.assembly.object.method("GetTypes").invoke(false);
            // On Unity 5.3.8f1, getting System.Reflection.Emit.OpCodes type name
            // without iterating all the classes first somehow blows things up at
            // app startup, hence the `Array.from`.
            return Array.from(types).map(e => new Il2Cpp.Class(Il2Cpp.Api._classFromSystemType(e)));
        } else {
            return Array.from(Array(this.classCount), (_, i) => new Il2Cpp.Class(Il2Cpp.Api._imageGetClass(this, i)));
        }
    }

    get recordClasses() {
        const record = {};
        if (Il2Cpp.unityVersionIsBelow201830) {
            const types = this.assembly.object.method("GetTypes").invoke(false);
            for (const type of Array.from(types)) {
                const klass = new Il2Cpp.Class(Il2Cpp.Api._classFromSystemType(type));
                record[klass.type.name] = klass;
            }
        } else {
            const end = this.classCount;
            for (let i = 0; i < end; i++) {
                const klass = new Il2Cpp.Class(Il2Cpp.Api._imageGetClass(this, i));
                record[klass.type.name] = klass;
            }
        }
        return utils.makeIterable(utils.addLevenshtein(record));
    }

    /** Gets the name of this image. */
    get name() {
        return Il2Cpp.Api._imageGetName(this).readUtf8String();
    }

    /** Gets the class with the specified name defined in this image. */
    class(name) {
        return this.tryClass(name);
    }

    /** Gets the class with the specified name defined in this image. */
    tryClass(name) {
        const dotIndex = name.lastIndexOf(".");
        const classNamespace = Memory.allocUtf8String(dotIndex == -1 ? "" : name.slice(0, dotIndex));
        const className = Memory.allocUtf8String(name.slice(dotIndex + 1));
        const handle = Il2Cpp.Api._classFromName(this, classNamespace, className);
        return handle.isNull() ? null : new Il2Cpp.Class(handle);
    }

    toString() {
        return {'addr': this.handle, 'name': this.name};
    }
};
__decorate([
    decorator_cache_getter.cache
], Il2CppImage.prototype, "assembly", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppImage.prototype, "classCount", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppImage.prototype, "classes", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppImage.prototype, "recordClasses", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppImage.prototype, "name", null);
__decorate([
    utils.levenshtein("classes", e => (e.namespace ? `${e.namespace}.${e.name}` : e.name))
], Il2CppImage.prototype, "class", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppImage, "corlib", null);
Il2CppImage = __decorate([
    utils.cacheInstances
], Il2CppImage);
Il2Cpp.Image = Il2CppImage;
