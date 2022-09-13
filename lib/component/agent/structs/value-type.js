"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const native_struct = require("../../utils/native-struct");

/** Value type class utility. */
class Il2CppValueType extends native_struct.NativeStruct {

    constructor(handle, type) {
        super(handle);
        this.type = type;
    }

    /** Boxes the current value type in a object. */
    box() {
        return new Il2Cpp.Object(Il2Cpp.Api._valueBox(this.type.class, this));
    }

    /** Gets the field with the given name. */
    field(name) {
        return this.type.class.field(name).withHolder(this);
    }

    /** */
    toString() {
        return this.isNull() ? "null" : this.box().toString();
    }
}

Il2Cpp.ValueType = Il2CppValueType;
