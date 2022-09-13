"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const utils = require("../utils");
const native_struct = require("../../utils/native-struct");

/** */
class Il2CppPointer extends native_struct.NativeStruct {

    constructor(handle, type) {
        super(handle);
        this.type = type;
    }

    /** Gets the element at the given index. */
    get(index) {
        return utils.read(this.handle.add(index * this.type.class.arrayElementSize), this.type);
    }

    /** Reads the given amount of elements starting at the given offset. */
    read(length, offset = 0) {
        const values = new Array(length);
        for (let i = 0; i < length; i++) {
            values[i] = this.get(i + offset);
        }
        return values;
    }

    /** Sets the given element at the given index */
    set(index, value) {
        utils.write(this.handle.add(index * this.type.class.arrayElementSize), value, this.type);
    }

    /** */
    toString() {
        return this.handle.toString();
    }

    /** Writes the given elements starting at the given index. */
    write(values, offset = 0) {
        for (let i = 0; i < values.length; i++) {
            this.set(i + offset, values[i]);
        }
    }
}

Il2Cpp.Pointer = Il2CppPointer;
