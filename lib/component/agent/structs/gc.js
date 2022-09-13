"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
const versioning = __importDefault(require("versioning"));

/** Garbage collector utility functions. */
class Il2CppGC {
    constructor() {
    }

    /** Gets the heap size in bytes. */
    static get heapSize() {
        return Il2Cpp.Api._gcGetHeapSize();
    }

    /** Determines whether the garbage collector is disabled. */
    static get isEnabled() {
        return !Il2Cpp.Api._gcIsDisabled();
    }

    /** Determines whether the garbage collector is incremental. */
    static get isIncremental() {
        return !!Il2Cpp.Api._gcIsIncremental();
    }

    /** Gets the number of nanoseconds the garbage collector can spend in a collection step. */
    static get maxTimeSlice() {
        return Il2Cpp.Api._gcGetMaxTimeSlice();
    }

    /** Gets the used heap size in bytes. */
    static get usedHeapSize() {
        return Il2Cpp.Api._gcGetUsedSize();
    }

    /** Enables or disables the garbage collector. */
    static set isEnabled(value) {
        value ? Il2Cpp.Api._gcEnable() : Il2Cpp.Api._gcDisable();
    }

    /** Sets the number of nanoseconds the garbage collector can spend in a collection step. */
    static set maxTimeSlice(nanoseconds) {
        Il2Cpp.Api._gcSetMaxTimeSlice(nanoseconds);
    }

    /** Returns the heap allocated objects of the specified class. This variant reads GC descriptors. */
    static choose(klass) {
        const matches = [];
        const callback = (objects, size, _) => {
            for (let i = 0; i < size; i++) {
                matches.push(
                    {
                        "addr": klass.handle,
                        "class_instance": objects.add(i * Process.pointerSize).readPointer()
                    });
            }
        };
        const chooseCallback = new NativeCallback(callback, "void", ["pointer", "int", "pointer"]);
        if (versioning.default.gte(Il2Cpp.unityVersion, "2021.2.0")) {
            const realloc = (handle, size) => {
                if (!handle.isNull() && size.compare(0) == 0) {
                    Il2Cpp.free(handle);
                    return NULL;
                } else {
                    return Il2Cpp.alloc(size);
                }
            };
            const reallocCallback = new NativeCallback(realloc, "pointer", ["pointer", "size_t", "pointer"]);
            const state = Il2Cpp.Api._livenessAllocateStruct(klass.handle, 0, chooseCallback, NULL, reallocCallback);
            Il2Cpp.Api._livenessCalculationFromStatics(state);
            Il2Cpp.Api._livenessFinalize(state);
            Il2Cpp.Api._livenessFreeStruct(state);
        } else {
            const onWorld = new NativeCallback(() => {
            }, "void", []);
            const state = Il2Cpp.Api._livenessCalculationBegin(klass.handle, 0, chooseCallback, NULL, onWorld, onWorld);
            Il2Cpp.Api._livenessCalculationFromStatics(state);
            Il2Cpp.Api._livenessCalculationEnd(state);
        }
        return matches;
    }

    /** Forces a garbage collection of the specified generation. */
    static collect(generation) {
        Il2Cpp.Api._gcCollect(generation < 0 ? 0 : generation > 2 ? 2 : generation);
    }

    /** Forces a garbage collection. */
    static collectALittle() {
        Il2Cpp.Api._gcCollectALittle();
    }

    /** Resumes all the previously stopped threads. */
    static startWorld() {
        return Il2Cpp.Api._gcStartWorld();
    }

    /** Performs an incremental garbage collection. */
    static startIncrementalCollection() {
        return Il2Cpp.Api._gcStartIncrementalCollection();
    }

    /** Stops all threads which may access the garbage collected heap, other than the caller. */
    static stopWorld() {
        return Il2Cpp.Api._gcStopWorld();
    }
}

Reflect.set(Il2Cpp, "GC", Il2CppGC);
