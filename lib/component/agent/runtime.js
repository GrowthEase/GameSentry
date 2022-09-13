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

/** */
class Il2CppRuntime {
    constructor() {
    }

    /** Gets the allocation granularity. */
    static get allocationGranularity() {
        return this.information[5];
    }

    /** Gets the size of the Il2CppArray struct. */
    static get arrayHeaderSize() {
        return this.information[2];
    }

    /** @internal */
    static get information() {
        // const snapshot = Il2Cpp.MemorySnapshot.capture();
        const snapshot = Il2Cpp.Api._memorySnapshotCapture();
        try {
            return Il2Cpp.Api._memorySnapshotGetRuntimeInformation(snapshot);
        } finally {
            Il2Cpp.Api._memorySnapshotFree(snapshot);
        }
    }

    /** Gets the pointer size. */
    static get pointerSize() {
        return this.information[0];
    }

    /** Gets the size of the Il2CppObject struct. */
    static get objectHeaderSize() {
        return this.information[1];
    }
}

__decorate([
    decorator_cache_getter.cache
], Il2CppRuntime, "information", null);
Il2Cpp.Runtime = Il2CppRuntime;
