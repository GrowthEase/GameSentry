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

/** Represents a `Il2CppType`. */
class Il2CppType extends native_struct.NonNullNativeStruct {
    /** Gets the class of this type. */
    get class() {
        return new Il2Cpp.Class(Il2Cpp.Api._classFromType(this));
    }

    /** */
    get fridaAlias() {
        if (this.isByReference) {
            return "pointer";
        }
        switch (this.typeEnum) {
            case 1 /* Void */
            :
                return "void";
            case 2 /* Boolean */
            :
                return "bool";
            case 3 /* Char */
            :
                return "uchar";
            case 4 /* I1 */
            :
                return "int8";
            case 5 /* U1 */
            :
                return "uint8";
            case 6 /* I2 */
            :
                return "int16";
            case 7 /* U2 */
            :
                return "uint16";
            case 8 /* I4 */
            :
                return "int32";
            case 9 /* U4 */
            :
                return "uint32";
            case 10 /* I8 */
            :
                return "int64";
            case 11 /* U8 */
            :
                return "uint64";
            case 12 /* R4 */
            :
                return "float";
            case 13 /* R8 */
            :
                return "double";
            case 17 /* ValueType */
            :
                return getValueTypeFields(this);
            case 24 /* NativeInteger */
            :
            case 25 /* UnsignedNativeInteger */
            :
            case 15 /* Pointer */
            :
            case 14 /* String */
            :
            case 29 /* SingleDimensionalZeroLowerBoundArray */
            :
            case 20 /* Array */
            :
                return "pointer";
            case 18 /* Class */
            :
            case 28 /* Object */
            :
            case 21 /* GenericInstance */
            :
                return this.class.isValueType ? getValueTypeFields(this) : "pointer";
            default:
                return "pointer";
        }
    }

    /** Determines whether this type is passed by reference. */
    get isByReference() {
        return !!Il2Cpp.Api._typeIsByReference(this);
    }

    /** Determines whether this type is primitive. */
    get isPrimitive() {
        return !!Il2Cpp.Api._typeIsPrimitive(this);
    }

    /** Gets the name of this type. */
    get name() {
        const handle = Il2Cpp.Api._typeGetName(this);
        try {
            return handle.readUtf8String();
        } finally {
            Il2Cpp.free(handle);
        }
    }

    /** Gets the encompassing object of the current type. */
    get object() {
        return new Il2Cpp.Object(Il2Cpp.Api._typeGetObject(this));
    }

    /** Gets the type enum of the current type. */
    get typeEnum() {
        return Il2Cpp.Api._typeGetTypeEnum(this);
    }

    /** */
    toString() {
        return this.name;
    }
}

__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "class", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "fridaAlias", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "isByReference", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "isPrimitive", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "name", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "object", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppType.prototype, "typeEnum", null);

function getValueTypeFields(type) {
    const instanceFields = type.class.fields.filter(f => !f.isStatic);
    return instanceFields.length == 0 ? ["char"] : instanceFields.map(f => f.type.fridaAlias);
}

Reflect.set(Il2Cpp, "Type", Il2CppType);
