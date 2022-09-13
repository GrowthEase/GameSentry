"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const utils = require("../utils");
const native_struct = require("../../utils/native-struct");
const console = require("../../utils/console");

/** Represent a parameter passed by reference. */
class Il2CppReference extends native_struct.NativeStruct {

    constructor(handle, type) {
        super(handle);
        this.type = type;
    }

    /** Gets the element referenced by the current reference. */
    get value() {
        return utils.read(this.handle, this.type);
    }

    /** Sets the element referenced by the current reference. */
    set value(value) {
        utils.write(this.handle, value, this.type);
    }

    /** */
    toString() {
        return this.isNull() ? "null" : `->${this.value}`;
    }

    /** Creates a reference to the specified value. */
    static to(value, type) {
        const handle = Memory.alloc(Process.pointerSize);
        switch (typeof value) {
            case "boolean":
                return new Il2Cpp.Reference(handle.writeS8(+value), Il2Cpp.Image.corlib.class("System.Boolean").type);
            case "number":
                switch (type.typeEnum) {
                    case 5 /* U1 */
                    :
                        return new Il2Cpp.Reference(handle.writeU8(value), type);
                    case 4 /* I1 */
                    :
                        return new Il2Cpp.Reference(handle.writeS8(value), type);
                    case 3 /* Char */
                    :
                    case 7 /* U2 */
                    :
                        return new Il2Cpp.Reference(handle.writeU16(value), type);
                    case 6 /* I2 */
                    :
                        return new Il2Cpp.Reference(handle.writeS16(value), type);
                    case 9 /* U4 */
                    :
                        return new Il2Cpp.Reference(handle.writeU32(value), type);
                    case 8 /* I4 */
                    :
                        return new Il2Cpp.Reference(handle.writeS32(value), type);
                    case 11 /* U8 */
                    :
                        return new Il2Cpp.Reference(handle.writeU64(value), type);
                    case 10 /* I8 */
                    :
                        return new Il2Cpp.Reference(handle.writeS64(value), type);
                    case 12 /* R4 */
                    :
                        return new Il2Cpp.Reference(handle.writeFloat(value), type);
                    case 13 /* R8 */
                    :
                        return new Il2Cpp.Reference(handle.writeDouble(value), type);
                }
            case "object":
                if (value instanceof Il2Cpp.ValueType || value instanceof Il2Cpp.Pointer) {
                    return new Il2Cpp.Reference(handle.writePointer(value), value.type);
                } else if (value instanceof Il2Cpp.Object) {
                    return new Il2Cpp.Reference(handle.writePointer(value), value.class.type);
                } else if (value instanceof Il2Cpp.String || value instanceof Il2Cpp.Array) {
                    return new Il2Cpp.Reference(handle.writePointer(value), value.object.class.type);
                } else if (value instanceof NativePointer) {
                    switch (type.typeEnum) {
                        case 25 /* UnsignedNativeInteger */
                        :
                        case 24 /* NativeInteger */
                        :
                            return new Il2Cpp.Reference(handle.writePointer(value), type);
                    }
                } else if (value instanceof Int64) {
                    return new Il2Cpp.Reference(handle.writeS64(value), Il2Cpp.Image.corlib.class("System.Int64").type);
                } else if (value instanceof UInt64) {
                    return new Il2Cpp.Reference(handle.writeU64(value), Il2Cpp.Image.corlib.class("System.UInt64").type);
                }
            default:
                console.raise(`don't know how to create a reference to ${value} using type ${type.name}`);
        }
    }
}

Il2Cpp.Reference = Il2CppReference;
