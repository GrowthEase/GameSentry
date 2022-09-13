"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const native_struct = require("../../utils/native-struct");

/** Represents a `Il2CppString`. */
class Il2CppString extends native_struct.NativeStruct {
    /** Gets the content of this string. */
    get content() {
        return Il2Cpp.Api._stringChars(this).readUtf16String(this.length);
    }

    /** Sets the content of this string. */
    set content(value) {
        Il2Cpp.Api._stringChars(this).writeUtf16String(value);
        Il2Cpp.Api._stringSetLength(this, value.length);
    }

    /** Gets the length of this string. */
    get length() {
        return Il2Cpp.Api._stringLength(this);
    }

    /** Gets the encompassing object of the current string. */
    get object() {
        return new Il2Cpp.Object(this);
    }

    /** */
    toString() {
        return this.isNull() ? "null" : `"${this.content}"`;
    }

    /** Creates a new string with the specified content. */
    static from(content) {
        return new Il2Cpp.String(Il2Cpp.Api._stringNew(Memory.allocUtf8String(content || "")));
    }
}

Il2Cpp.String = Il2CppString;
