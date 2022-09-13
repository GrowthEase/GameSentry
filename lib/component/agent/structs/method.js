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
const utils_1 = require("../../utils/utils");
const utils_2 = require("../utils");

/** Represents a `MethodInfo`. */
class Il2CppMethod extends native_struct.NonNullNativeStruct {
    /** Gets the class in which this method is defined. */
    get class() {
        return new Il2Cpp.Class(Il2Cpp.Api._methodGetClass(this));
    }

    /** Gets the flags of the current method. */
    get flags() {
        return Il2Cpp.Api._methodGetFlags(this, NULL);
    }

    /** Gets the implementation flags of the current method. */
    get implementationFlags() {
        const implementationFlagsPointer = Memory.alloc(Process.pointerSize);
        Il2Cpp.Api._methodGetFlags(this, implementationFlagsPointer);
        return implementationFlagsPointer.readU32();
    }

    /** */
    get fridaSignature() {
        const types = [];
        for (const parameter of this.parameters) {
            types.push(parameter.type.fridaAlias);
        }
        if (!this.isStatic || Il2Cpp.unityVersionIsBelow201830) {
            types.unshift("pointer");
        }
        if (this.isInflated) {
            types.push("pointer");
        }
        return types;
    }

    /** Gets the amount of generic parameters of this generic method. */
    get genericParameterCount() {
        if (!this.isGeneric) {
            return 0;
        }
        return this.object.method("GetGenericArguments").invoke().length;
    }

    /** Determines whether this method is external. */
    get isExternal() {
        return !!Il2Cpp.Api._methodIsExternal(this);
    }

    /** Determines whether this method is generic. */
    get isGeneric() {
        return !!Il2Cpp.Api._methodIsGeneric(this);
    }

    /** Determines whether this method is inflated (generic with a concrete type parameter). */
    get isInflated() {
        return !!Il2Cpp.Api._methodIsInflated(this);
    }

    /** Determines whether this method is static. */
    get isStatic() {
        return !Il2Cpp.Api._methodIsInstance(this);
    }

    /** Determines whether this method is synchronized. */
    get isSynchronized() {
        return !!Il2Cpp.Api._methodIsSynchronized(this);
    }

    /** Gets the access modifier of this method. */
    get modifier() {
        return Il2Cpp.Api._methodGetModifier(this).readUtf8String();
    }

    /** Gets the name of this method. */
    get name() {
        return Il2Cpp.Api._methodGetName(this).readUtf8String();
    }

    /** @internal */
    get nativeFunction() {
        return new NativeFunction(this.virtualAddress, this.returnType.fridaAlias, this.fridaSignature);
    }

    /** Gets the encompassing object of the current method. */
    get object() {
        return new Il2Cpp.Object(Il2Cpp.Api._methodGetObject(this, NULL));
    }

    /** Gets the amount of parameters of this method. */
    get parameterCount() {
        return Il2Cpp.Api._methodGetParameterCount(this);
    }

    /** Gets the parameters of this method. */
    get parameters() {
        return Array.from(Array(this.parameterCount), (_, i) => {
            const parameterName = Il2Cpp.Api._methodGetParameterName(this, i).readUtf8String();
            const parameterType = Il2Cpp.Api._methodGetParameterType(this, i);
            return new Il2Cpp.Parameter(parameterName, i, new Il2Cpp.Type(parameterType));
        });
    }

    /** Gets the relative virtual address (RVA) of this method. */
    get relativeVirtualAddress() {
        return this.virtualAddress.sub(Il2Cpp.module.base);
    }

    /** Gets the return type of this method. */
    get returnType() {
        return new Il2Cpp.Type(Il2Cpp.Api._methodGetReturnType(this));
    }

    /** Gets the virtual address (VA) to this method. */
    get virtualAddress() {
        return Il2Cpp.Api._methodGetPointer(this);
    }

    /** Replaces the body of this method. */
    set implementation(block) {
        const startIndex = +!this.isStatic | +Il2Cpp.unityVersionIsBelow201830;
        const callback = (...args) => {
            const parameters = this.parameters.map((e, i) => utils_2.fromFridaValue(args[i + startIndex], e.type));
            return utils_2.toFridaValue(block.call(this.isStatic ? this.class : new Il2Cpp.Object(args[0]), ...parameters));
        };
        try {
            this.revert();
            Interceptor.replace(this.virtualAddress, new NativeCallback(callback, this.returnType.fridaAlias, this.fridaSignature));
        } catch (e) {
            switch (e.message) {
                case "access violation accessing 0x0":
                    console.raise(`cannot implement method ${this.name}: it has a NULL virtual address`);
                case `unable to intercept function at ${this.virtualAddress}; please file a bug`:
                    console.warn(`cannot implement method ${this.name}: it may be a thunk`);
                    break;
                case "already replaced this function":
                    console.warn(`cannot implement method ${this.name}: already replaced by a thunk`);
                    break;
                default:
                    throw e;
            }
        }
    }

    /** Creates a generic instance of the current generic method. */
    inflate(...classes) {
        if (!this.isGeneric) {
            console.raise(`cannot inflate method ${this.name}: it has no generic parameters`);
        }
        if (this.genericParameterCount != classes.length) {
            console.raise(`cannot inflate method ${this.name}: it needs ${this.genericParameterCount} generic parameter(s), not ${classes.length}`);
        }
        const types = classes.map(klass => klass.type.object);
        const typeArray = Il2Cpp.Array.from(Il2Cpp.Image.corlib.class("System.Type"), types);
        const inflatedMethodObject = this.object.method("MakeGenericMethod", 1).invoke(typeArray);
        return new Il2Cpp.Method(Il2Cpp.Api._methodGetFromReflection(inflatedMethodObject));
    }

    /** Invokes this method. */
    invoke(...parameters) {
        if (!this.isStatic) {
            console.raise(`cannot invoke a non-static method ${this.name}: must be invoked throught a Il2Cpp.Object, not a Il2Cpp.Class`);
        }
        return this.invokeRaw(NULL, ...parameters);
    }

    /** @internal */
    invokeRaw(instance, ...parameters) {
        const allocatedParameters = parameters.map(utils_2.toFridaValue);
        if (!this.isStatic || Il2Cpp.unityVersionIsBelow201830) {
            allocatedParameters.unshift(instance);
        }
        if (this.isInflated) {
            allocatedParameters.push(this.handle);
        }
        try {
            const new_function = new NativeFunction(this.virtualAddress, this.returnType.fridaAlias, this.fridaSignature)
            const returnValue = new_function(...allocatedParameters);
            return utils_2.fromFridaValue(returnValue, this.returnType);
        } catch (e) {
            if (e == null) {
                console.raise("an unexpected native function exception occurred, this is due to parameter types mismatch");
            }
            switch (e.message) {
                case "bad argument count":
                    console.raise(`cannot invoke method ${this.name}: it needs ${this.parameterCount} parameter(s), not ${parameters.length}`);
                case "expected a pointer":
                case "expected number":
                case "expected array with fields":
                    console.raise(`cannot invoke method ${this.name}: parameter types mismatch`);
            }
            throw e;
        }
    }

    /** Gets the overloaded method with the given parameter types. */
    overload(...parameterTypes) {
        const result = this.tryOverload(...parameterTypes);
        if (result != undefined)
            return result;
        console.raise(`cannot find overloaded method ${this.name}(${parameterTypes})`);
    }

    /** Gets the parameter with the given name. */
    parameter(name) {
        return this.tryParameter(name);
    }

    /** Restore the original method implementation. */
    revert() {
        Interceptor.revert(this.virtualAddress);
        Interceptor.flush();
    }

    /** Gets the overloaded method with the given parameter types. */
    tryOverload(...parameterTypes) {
        return this.class.methods.find(e => e.name == this.name &&
            e.parameterCount == parameterTypes.length &&
            e.parameters.every((e, i) => e.type.name == parameterTypes[i]));
    }

    /** Gets the parameter with the given name. */
    tryParameter(name) {
        return this.parameters.find(e => e.name == name);
    }

    /** */
    toString() {
        let array = [];
        for (const param of this.parameters) {
            array.push(param.toString())
        }
        return {
            'addr': this.handle,
            'name': this.name,
            'modifier': this.modifier,
            'className': this.returnType.name,
            'parameters': array,

        };
    }

    show() {
        let array = [];
        for (const param of this.parameters) {
            array.push(param.show())
        }
        return `\
${this.isStatic ? `static ` : ``}\
${this.returnType.name} \
${this.name}\
(${array.join(`, `)});\
${this.virtualAddress.isNull() ? `` : ` // 0x${this.relativeVirtualAddress.toString(16).padStart(8, `0`)}`}`;
    }

    /** @internal */
    withHolder(instance) {
        return new Proxy(this, {
            get(target, property) {
                switch (property) {
                    case "invoke":
                        return target.invokeRaw.bind(target, instance.handle);
                    case "inflate":
                    case "overload":
                    case "tryOverload":
                        return function (...args) {
                            return target[property](...args).withHolder(instance);
                        };
                }
                return Reflect.get(target, property);
            }
        });
    }
}

__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "class", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "flags", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "implementationFlags", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "fridaSignature", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "genericParameterCount", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "isExternal", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "isGeneric", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "isInflated", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "isStatic", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "isSynchronized", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "name", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "nativeFunction", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "object", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "parameterCount", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "parameters", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "relativeVirtualAddress", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "returnType", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppMethod.prototype, "virtualAddress", null);
__decorate([
    utils_1.levenshtein("parameters")
], Il2CppMethod.prototype, "parameter", null);
Reflect.set(Il2Cpp, "Method", Il2CppMethod);
