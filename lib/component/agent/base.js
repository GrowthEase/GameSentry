"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length,
        r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
const decorator_cache_getter = require("decorator-cache-getter");
const versioning = __importDefault(require("versioning"));
const console = require("../utils/console");


/** */
class Il2CppBase {
    constructor() {
    }

    /** @internal Gets the Il2Cpp module name. */
    static get moduleName() {
        switch (Process.platform) {
            case "linux":
                try {
                    const _ = Java.androidVersion;
                    return "libil2cpp.so";
                } catch (e) {
                    return "GameAssembly.so";
                }
            case "windows":
                return "GameAssembly.dll";
            case "darwin":
                try {
                    return "UnityFramework";
                } catch (e) {
                    return "GameAssembly.dylib";
                }
        }
        console.raise(`${Process.platform} is not supported yet`);
    }

    /** */
    static get applicationDataPath() {
        const get_persistentDataPath = this.internalCall("UnityEngine.Application::get_persistentDataPath", "pointer", []);
        return new Il2Cpp.String(get_persistentDataPath()).content;
    }

    /** */
    static get applicationIdentifier() {
        let get_identifier = null;
        if (this.internalCall("UnityEngine.Application::get_identifier", "pointer", [])) {
            get_identifier = this.internalCall("UnityEngine.Application::get_identifier", "pointer", []);
        } else {
            get_identifier = this.internalCall("UnityEngine.Application::get_bundleIdentifier", "pointer", []);
        }
        return get_identifier ? new Il2Cpp.String(get_identifier()).content : null;
    }

    /** Gets the version of the application */
    static get applicationVersion() {
        const get_version = this.internalCall("UnityEngine.Application::get_version", "pointer", []);
        return get_version ? new Il2Cpp.String(get_version()).content : null;
    }


    /** Gets the Il2Cpp module as a Frida module. */
    static get module() {
        return Process.getModuleByName(this.moduleName);
    }

    /** Gets the Unity version of the current application. */
    static get unityVersion() {
        const get_unityVersion = this.internalCall("UnityEngine.Application::get_unityVersion", "pointer", []);
        if (get_unityVersion == null) {
            const unityModule = Process.getModuleByName("libunity.so")
            const ranges = [...unityModule.enumerateRanges("r--"), Process.getRangeByAddress(unityModule.base)];
            for (const range of ranges) {
                const scan = Memory.scanSync(range.base, range.size, "45787065637465642076657273696f6e3a")[0];
                if (scan !== undefined) {
                    const str = scan.address.readUtf8String()
                    const matchPattern = /(20\d{2}|\d)\.(\d)\.(\d{1,2})([abcfp]|rc){0,2}\d?/;
                    const matches = str.match(matchPattern)
                    console.inform("unity:"+matches ? matches[0] : str)
                    return matches ? matches[0] : str

                }
            }
            console.raise("couldn't determine the Unity version, please specify it manually");
        }
        return new Il2Cpp.String(get_unityVersion()).content;
    }


    /** @internal */
    static get unityVersionIsBelow201830() {
        return versioning.default.lt(this.unityVersion, "2018.3.0");
    }

    /** Allocates the given amount of bytes. */
    static alloc(size = Process.pointerSize) {
        return Il2Cpp.Api._alloc(size);
    }


    /** Frees memory. */
    static free(pointer) {
        return Il2Cpp.Api._free(pointer);
    }

    /** */
    static installExceptionListener(targetThread = "current") {
        const threadId = Process.getCurrentThreadId();
        return Interceptor.attach(Il2Cpp.module.getExportByName("__cxa_throw"), function (args) {
            if (targetThread == "current" && this.threadId != threadId) {
                return;
            }
            console.inform(new Il2Cpp.Object(args[0].readPointer()));
        });
    }

    /** */
    static internalCall(name, retType, argTypes) {
        const handle = Il2Cpp.Api._resolveInternalCall(Memory.allocUtf8String(name));
        return handle.isNull() ? null : new NativeFunction(handle, retType, argTypes);
    }


    /** Creates a new `Il2Cpp.Tracer` instance. */
    static trace() {
        return new Il2Cpp.Tracer();
    }
}

__decorate([
    decorator_cache_getter.cache
], Il2CppBase, "applicationDataPath", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppBase, "applicationIdentifier", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppBase, "applicationVersion", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppBase, "module", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppBase, "unityVersion", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppBase, "unityVersionIsBelow201830", null);
Reflect.set(globalThis, "Il2Cpp", Il2CppBase);
