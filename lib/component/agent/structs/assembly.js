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
/** Represents a `Il2CppAssembly`. */
let Il2CppAssembly = class Il2CppAssembly extends native_struct.NonNullNativeStruct {
    /** Gets the image of this assembly. */
    get image() {
        return new Il2Cpp.Image(Il2Cpp.Api._assemblyGetImage(this));
    }

    /** Gets the name of this assembly. */
    get name() {
        return this.image.name.replace(".dll", "");
    }

    /** Gets the encompassing object of the current assembly. */
    get object() {
        return Il2Cpp.Image.corlib.class("System.Reflection.Assembly").method("Load").invoke(Il2Cpp.String.from(this.name));
    }
};
__decorate([
    decorator_cache_getter.cache
], Il2CppAssembly.prototype, "image", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppAssembly.prototype, "name", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppAssembly.prototype, "object", null);
Il2CppAssembly = __decorate([
    utils.cacheInstances
], Il2CppAssembly);
Il2Cpp.Assembly = Il2CppAssembly;
