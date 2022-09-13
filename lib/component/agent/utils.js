"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.toFridaValue = exports.fromFridaValue = exports.write = exports.read = void 0;
const console = require("../utils/console");
const native_struct = require("../utils/native-struct");

/** @internal */
function read(pointer, type) {
    switch (type.typeEnum) {
        case 2 /* Boolean */
        :
            return !!pointer.readS8();
        case 4 /* I1 */
        :
            return pointer.readS8();
        case 5 /* U1 */
        :
            return pointer.readU8();
        case 6 /* I2 */
        :
            return pointer.readS16();
        case 7 /* U2 */
        :
            return pointer.readU16();
        case 8 /* I4 */
        :
            return pointer.readS32();
        case 9 /* U4 */
        :
            return pointer.readU32();
        case 3 /* Char */
        :
            return pointer.readU16();
        case 10 /* I8 */
        :
            return pointer.readS64();
        case 11 /* U8 */
        :
            return pointer.readU64();
        case 12 /* R4 */
        :
            return pointer.readFloat();
        case 13 /* R8 */
        :
            return pointer.readDouble();
        case 24 /* NativeInteger */
        :
        case 25 /* UnsignedNativeInteger */
        :
            return pointer.readPointer();
        case 15 /* Pointer */
        :
            return new Il2Cpp.Pointer(pointer.readPointer(), type.class.baseType);
        case 17 /* ValueType */
        :
            return new Il2Cpp.ValueType(pointer, type);
        case 28 /* Object */
        :
        case 18 /* Class */
        :
            return new Il2Cpp.Object(pointer.readPointer());
        case 21 /* GenericInstance */
        :
            return type.class.isValueType ? new Il2Cpp.ValueType(pointer, type) : new Il2Cpp.Object(pointer.readPointer());
        case 14 /* String */
        :
            return new Il2Cpp.String(pointer.readPointer());
        case 29 /* SingleDimensionalZeroLowerBoundArray */
        :
        case 20 /* Array */
        :
            return new Il2Cpp.Array(pointer.readPointer());
    }
    console.raise(`read: "${type.name}" (${type.typeEnum}) has not been handled yet. Please file an issue!`);
}

exports.read = read;

/** @internal */
function write(pointer, value, type) {
    switch (type.typeEnum) {
        case 2 /* Boolean */
        :
            return pointer.writeS8(+value);
        case 4 /* I1 */
        :
            return pointer.writeS8(value);
        case 5 /* U1 */
        :
            return pointer.writeU8(value);
        case 6 /* I2 */
        :
            return pointer.writeS16(value);
        case 7 /* U2 */
        :
            return pointer.writeU16(value);
        case 8 /* I4 */
        :
            return pointer.writeS32(value);
        case 9 /* U4 */
        :
            return pointer.writeU32(value);
        case 3 /* Char */
        :
            return pointer.writeU16(value);
        case 10 /* I8 */
        :
            return pointer.writeS64(value);
        case 11 /* U8 */
        :
            return pointer.writeU64(value);
        case 12 /* R4 */
        :
            return pointer.writeFloat(value);
        case 13 /* R8 */
        :
            return pointer.writeDouble(value);
        case 24 /* NativeInteger */
        :
        case 25 /* UnsignedNativeInteger */
        :
        case 15 /* Pointer */
        :
        case 17 /* ValueType */
        :
        case 14 /* String */
        :
        case 28 /* Object */
        :
        case 18 /* Class */
        :
        case 29 /* SingleDimensionalZeroLowerBoundArray */
        :
        case 20 /* Array */
        :
        case 21 /* GenericInstance */
        :
            if (value instanceof Il2Cpp.ValueType) {
                Memory.copy(pointer, value.handle, type.class.valueSize);
                return pointer;
            }
            return pointer.writePointer(value);
    }
    console.raise(`write: "${type.name}" (${type.typeEnum}) has not been handled yet. Please file an issue!`);
}

exports.write = write;

/** @internal */
function fromFridaValue(value, type) {
    if (Array.isArray(value)) {
        return arrayToValueType(type, value);
    } else if (value instanceof NativePointer) {
        if (type.isByReference) {
            return new Il2Cpp.Reference(value, type);
        }
        switch (type.typeEnum) {
            case 15 /* Pointer */
            :
                return new Il2Cpp.Pointer(value, type.class.baseType);
            case 14 /* String */
            :
                return new Il2Cpp.String(value);
            case 18 /* Class */
            :
            case 21 /* GenericInstance */
            :
            case 28 /* Object */
            :
                return new Il2Cpp.Object(value);
            case 29 /* SingleDimensionalZeroLowerBoundArray */
            :
            case 20 /* Array */
            :
                return new Il2Cpp.Array(value);
            default:
                return value;
        }
    } else if (type.typeEnum == 2 /* Boolean */) {
        return !!value;
    } else {
        return value;
    }
}

exports.fromFridaValue = fromFridaValue;

/** @internal */
function toFridaValue(value) {
    if (typeof value == "boolean") {
        return +value;
    } else if (value instanceof Il2Cpp.ValueType) {
        return valueTypeToArray(value);
    } else {
        return value;
    }
}

exports.toFridaValue = toFridaValue;

function valueTypeToArray(value) {
    const instanceFields = value.type.class.fields.filter(f => !f.isStatic);
    return instanceFields.length == 0
        ? [value.handle.readU8()]
        : instanceFields
            .map(field => field.withHolder(value).value)
            .map(value => value instanceof Il2Cpp.ValueType
                ? valueTypeToArray(value)
                : value instanceof native_struct.NativeStruct
                    ? value.handle
                    : typeof value == "boolean"
                        ? +value
                        : value);
}

function arrayToValueType(type, nativeValues) {
    function iter(type, startOffset = 0) {
        const arr = [];
        for (const field of type.class.fields) {
            if (!field.isStatic) {
                const offset = startOffset + field.offset - Il2Cpp.Runtime.objectHeaderSize;
                if (field.type.typeEnum == 17 /* ValueType */ ||
                    (field.type.typeEnum == 21 /* GenericInstance */ && field.type.class.isValueType)) {
                    arr.push(...iter(field.type, offset));
                } else {
                    arr.push([field.type.typeEnum, offset]);
                }
            }
        }
        if (arr.length == 0) {
            arr.push([5 /* U1 */, 0]);
        }
        return arr;
    }

    const valueType = Memory.alloc(type.class.valueSize);
    nativeValues = nativeValues.flat(Infinity);
    const typesAndOffsets = iter(type);
    for (let i = 0; i < nativeValues.length; i++) {
        const value = nativeValues[i];
        const [typeEnum, offset] = typesAndOffsets[i];
        const pointer = valueType.add(offset);
        switch (typeEnum) {
            case 2 /* Boolean */
            :
                pointer.writeS8(value);
                break;
            case 4 /* I1 */
            :
                pointer.writeS8(value);
                break;
            case 5 /* U1 */
            :
                pointer.writeU8(value);
                break;
            case 6 /* I2 */
            :
                pointer.writeS16(value);
                break;
            case 7 /* U2 */
            :
                pointer.writeU16(value);
                break;
            case 8 /* I4 */
            :
                pointer.writeS32(value);
                break;
            case 9 /* U4 */
            :
                pointer.writeU32(value);
                break;
            case 3 /* Char */
            :
                pointer.writeU16(value);
                break;
            case 10 /* I8 */
            :
                pointer.writeS64(value);
                break;
            case 11 /* U8 */
            :
                pointer.writeU64(value);
                break;
            case 12 /* R4 */
            :
                pointer.writeFloat(value);
                break;
            case 13 /* R8 */
            :
                pointer.writeDouble(value);
                break;
            case 24 /* NativeInteger */
            :
            case 25 /* UnsignedNativeInteger */
            :
            case 15 /* Pointer */
            :
            case 29 /* SingleDimensionalZeroLowerBoundArray */
            :
            case 20 /* Array */
            :
            case 14 /* String */
            :
            case 28 /* Object */
            :
            case 18 /* Class */
            :
            case 21 /* GenericInstance */
            :
                pointer.writePointer(value);
                break;
            default:
                console.warn(`arrayToValueType: defaulting ${typeEnum} to pointer`);
                pointer.writePointer(value);
                break;
        }
    }
    return new Il2Cpp.ValueType(valueType, type);
}
