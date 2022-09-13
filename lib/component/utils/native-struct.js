"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.NonNullNativeStruct = exports.NativeStruct = void 0;

/** Scaffold class. */
class NativeStruct {

    constructor(handleOrWrapper) {
        if (handleOrWrapper instanceof NativePointer) {
            this.handle = handleOrWrapper;
        } else {
            this.handle = handleOrWrapper.handle;
        }
    }

    equals(other) {
        return this.handle.equals(other.handle);
    }

    isNull() {
        return this.handle.isNull();
    }
}

exports.NativeStruct = NativeStruct;

/** Scaffold class whom pointer cannot be null. */
class NonNullNativeStruct extends NativeStruct {
    constructor(handle) {
        super(handle);

    }
}

exports.NonNullNativeStruct = NonNullNativeStruct;
