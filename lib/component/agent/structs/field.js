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
const console = require("../../utils/console");
const native_struct = require("../../utils/native-struct");
const utils = require("../utils");

/** Represents a `FieldInfo`. */
class Il2CppField extends native_struct.NonNullNativeStruct {
    /** Gets the class in which this field is defined. */
    get class() {
        return new Il2Cpp.Class(Il2Cpp.Api._fieldGetClass(this));
    }

    /** Gets the flags of the current field. */
    get flags() {
        return Il2Cpp.Api._fieldGetFlags(this);
    }

    /** Determines whether this field value is known at compile time. */
    get isLiteral() {
        return !!Il2Cpp.Api._fieldIsLiteral(this);
    }

    /** Determines whether this field is static. */
    get isStatic() {
        return !!Il2Cpp.Api._fieldIsStatic(this);
    }

    /** Determines whether this field is thread static. */
    get isThreadStatic() {
        return !!Il2Cpp.Api._fieldIsThreadStatic(this);
    }

    /** Gets the access modifier of this field. */
    get modifier() {
        return Il2Cpp.Api._fieldGetModifier(this).readUtf8String();
    }

    /** Gets the name of this field. */
    get name() {
        return Il2Cpp.Api._fieldGetName(this).readUtf8String();
    }

    /** Gets the offset of this field, calculated as the difference with its owner virtual address. */
    get offset() {
        return Il2Cpp.Api._fieldGetOffset(this);
    }

    /** Gets the type of this field. */
    get type() {
        return new Il2Cpp.Type(Il2Cpp.Api._fieldGetType(this));
    }

    /** Gets the value of this field. */
    get value() {
        const handle = Memory.alloc(Process.pointerSize);
        Il2Cpp.Api._fieldGetStaticValue(this.handle, handle);
        return utils.read(handle, this.type);
    }

    /** Sets the value of this field. Thread static or literal values cannot be altered yet. */
    set value(value) {
        if (this.isThreadStatic || this.isLiteral) {
            console.raise(`cannot modify the value of field ${this.name}: is thread static or literal`);
        }
        const handle = Memory.alloc(Process.pointerSize);
        utils.write(handle, value, this.type);
        Il2Cpp.Api._fieldSetStaticValue(this.handle, handle);
    }

    instanceGetValue(addr) {
        return utils.read(addr, this.type);
    }

    instanceSetValue(addr, value) {
        utils.write(addr, value, this.type);
    }

    /** */
    toString() {
        return {
            'field': this.handle,
            'name': this.name,
            'filedOffset': this.offset,
            'fieldModifier': this.modifier,
            'fieldName': this.type.name,
            'fieldTypeValue': this.type.fridaAlias
        };
    }

    show() {
        return `\
${this.isThreadStatic ? `[ThreadStatic] ` : ``}\
${this.isStatic ? `static ` : ``}\
${this.type.name} \
${this.name}\
${this.isLiteral ? ` = ${this.type.class.isEnum ? utils.read(this.value.handle, this.type.class.baseType) : this.value}` : ``};\
${this.isThreadStatic || this.isLiteral ? `` : ` // 0x${this.offset.toString(16)}`}`;
    }

    /** @internal */
    withHolder(instance) {
        let valueHandle = instance.handle.add(this.offset);
        if (instance instanceof Il2Cpp.ValueType) {
            valueHandle = valueHandle.sub(Il2Cpp.Runtime.objectHeaderSize);
        }
        return new Proxy(this, {
            get(target, property) {
                if (property == "value") {
                    return utils.read(valueHandle, target.type);
                }
                return Reflect.get(target, property);
            },
            set(target, property, value) {
                if (property == "value") {
                    utils.write(valueHandle, value, target.type);
                    return true;
                }
                return Reflect.set(target, property, value);
            }
        });
    }
}

__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "class", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "flags", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "isLiteral", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "isStatic", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "isThreadStatic", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "name", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "offset", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppField.prototype, "type", null);
Reflect.set(Il2Cpp, "Field", Il2CppField);
