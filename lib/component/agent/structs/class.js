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
const utils = require("../../utils/utils");
/** Represents a `Il2CppClass`. */
let Il2CppClass = class Il2CppClass extends native_struct.NonNullNativeStruct {
    /** Gets the actual size of the instance of the current class. */
    get actualInstanceSize() {
        return Il2Cpp.Api._classGetActualInstanceSize(this);
    }

    /** Gets the array class which encompass the current class. */
    get arrayClass() {
        return new Il2Cpp.Class(Il2Cpp.Api._classGetArrayClass(this, 1));
    }

    /** Gets the size of the object encompassed by the current array class. */
    get arrayElementSize() {
        return Il2Cpp.Api._classGetArrayElementSize(this);
    }

    /** Gets the name of the assembly in which the current class is defined. */
    get assemblyName() {
        return Il2Cpp.Api._classGetAssemblyName(this).readUtf8String();
    }

    /** Gets the class that declares the current nested class. */
    get declaringClass() {
        const handle = Il2Cpp.Api._classGetDeclaringType(this);
        return handle.isNull() ? null : new Il2Cpp.Class(handle);
    }

    /** Gets the encompassed type of this array, reference, pointer or enum type. */
    get baseType() {
        const handle = Il2Cpp.Api._classGetBaseType(this);
        return handle.isNull() ? null : new Il2Cpp.Type(handle);
    }

    /** Gets the class of the object encompassed or referred to by the current array, pointer or reference class. */
    get elementClass() {
        const handle = Il2Cpp.Api._classGetElementClass(this);
        return handle.isNull() ? null : new Il2Cpp.Class(handle);
    }

    /** Gets the fields of the current class. */
    get fields() {
        return Array.from(utils.nativeIterator(this, Il2Cpp.Api._classGetFields, Il2Cpp.Field));
    }

    get fieldsNum() {
        return Il2Cpp.Api._classNumFields(this);
    }

    /** Gets the flags of the current class. */
    get flags() {
        return Il2Cpp.Api._classGetFlags(this);
    }

    /** Gets the amount of generic parameters of this generic class. */
    get genericParameterCount() {
        if (!this.isGeneric) {
            return 0;
        }
        return this.type.object.method("GetGenericArguments").invoke().length;
    }

    /** Determines whether the GC has tracking references to the current class instances. */
    get hasReferences() {
        return !!Il2Cpp.Api._classHasReferences(this);
    }

    /** Determines whether ther current class has a valid static constructor. */
    get hasStaticConstructor() {
        const staticConstructor = this.tryMethod(".cctor");
        return staticConstructor != null && !staticConstructor.virtualAddress.isNull();
    }

    /** Gets the image in which the current class is defined. */
    get image() {
        return new Il2Cpp.Image(Il2Cpp.Api._classGetImage(this));
    }

    /** Gets the size of the instance of the current class. */
    get instanceSize() {
        return Il2Cpp.Api._classGetInstanceSize(this);
    }

    /** Determines whether the current class is abstract. */
    get isAbstract() {
        return !!Il2Cpp.Api._classIsAbstract(this);
    }

    /** Determines whether the current class is blittable. */
    get isBlittable() {
        return !!Il2Cpp.Api._classIsBlittable(this);
    }

    /** Determines whether the current class is an enumeration. */
    get isEnum() {
        return !!Il2Cpp.Api._classIsEnum(this);
    }

    /** Determines whether the current class is a generic one. */
    get isGeneric() {
        return !!Il2Cpp.Api._classIsGeneric(this);
    }

    /** Determines whether the current class is inflated. */
    get isInflated() {
        return !!Il2Cpp.Api._classIsInflated(this);
    }

    /** Determines whether the current class is an interface. */
    get isInterface() {
        return !!Il2Cpp.Api._classIsInterface(this);
    }

    /** Determines whether the current class is a value type. */
    get isValueType() {
        return !!Il2Cpp.Api._classIsValueType(this);
    }

    /** Gets the interfaces implemented or inherited by the current class. */
    get interfaces() {
        return Array.from(utils.nativeIterator(this, Il2Cpp.Api._classGetInterfaces, Il2Cpp.Class));
    }

    /** Gets the methods implemented by the current class. */
    get methods() {
        return Array.from(utils.nativeIterator(this, Il2Cpp.Api._classGetMethods, Il2Cpp.Method));
    }

    /** Gets the name of the current class. */
    get name() {
        return Il2Cpp.Api._classGetName(this).readUtf8String();
    }

    /** Gets the namespace of the current class. */
    get namespace() {
        return Il2Cpp.Api._classGetNamespace(this).readUtf8String();
    }

    /** Gets the classes nested inside the current class. */
    get nestedClasses() {
        return Array.from(utils.nativeIterator(this, Il2Cpp.Api._classGetNestedClasses, Il2Cpp.Class));
    }

    /** Gets the class from which the current class directly inherits. */
    get parent() {
        const handle = Il2Cpp.Api._classGetParent(this);
        return handle.isNull() ? null : new Il2Cpp.Class(handle);
    }

    /** Gets the rank (number of dimensions) of the current array class. */
    get rank() {
        return Il2Cpp.Api._classGetRank(this);
    }

    /** Gets a pointer to the static fields of the current class. */
    get staticFieldsData() {
        return Il2Cpp.Api._classGetStaticFieldData(this);
    }

    /** Gets the size of the instance - as a value type - of the current class. */
    get valueSize() {
        return Il2Cpp.Api._classGetValueSize(this, NULL);
    }

    /** Gets the type of the current class. */
    get type() {
        return new Il2Cpp.Type(Il2Cpp.Api._classGetType(this));
    }

    /** Allocates a new object of the current class. */
    alloc() {
        return new Il2Cpp.Object(Il2Cpp.Api._objectNew(this));
    }

    /** Gets the field identified by the given name. */
    field(name) {
        return this.tryField(name);
    }

    /** Builds a generic instance of the current generic class. */
    inflate(...classes) {
        if (!this.isGeneric) {
            console.raise(`cannot inflate class ${this.type.name}: it has no generic parameters`);
        }
        if (this.genericParameterCount != classes.length) {
            console.raise(`cannot inflate class ${this.type.name}: it needs ${this.genericParameterCount} generic parameter(s), not ${classes.length}`);
        }
        const types = classes.map(klass => klass.type.object);
        const typeArray = Il2Cpp.Array.from(Il2Cpp.Image.corlib.class("System.Type"), types);
        const inflatedType = this.type.object.method("MakeGenericType", 1).invoke(typeArray);
        return new Il2Cpp.Class(Il2Cpp.Api._classFromSystemType(inflatedType));
    }

    /** Calls the static constructor of the current class. */
    initialize() {
        Il2Cpp.Api._classInit(this);
    }

    /** Determines whether an instance of `other` class can be assigned to a variable of the current type. */
    isAssignableFrom(other) {
        return !!Il2Cpp.Api._classIsAssignableFrom(this, other);
    }

    /** Determines whether the current class derives from `other` class. */
    isSubclassOf(other, checkInterfaces) {
        return !!Il2Cpp.Api._classIsSubclassOf(this, other, +checkInterfaces);
    }

    /** Gets the method identified by the given name and parameter count. */
    method(name, parameterCount = -1) {
        return this.tryMethod(name, parameterCount);
    }

    /** Gets the nested class with the given name. */
    nested(name) {
        return this.tryNested(name);
    }

    /** Allocates a new object of the current class and calls its default constructor. */
    new() {
        const object = this.alloc();
        const exceptionArray = Memory.alloc(Process.pointerSize);
        Il2Cpp.Api._objectInit(object, exceptionArray);
        const exception = exceptionArray.readPointer();
        if (!exception.isNull()) {
            console.raise(new Il2Cpp.Object(exception).toString());
        }
        return object;
    }

    /** Gets the field with the given name. */
    tryField(name) {
        const handle = Il2Cpp.Api._classGetFieldFromName(this, Memory.allocUtf8String(name));
        return handle.isNull() ? null : new Il2Cpp.Field(handle);
    }

    /** Gets the method with the given name and parameter count. */
    tryMethod(name, parameterCount = -1) {
        const handle = Il2Cpp.Api._classGetMethodFromName(this, Memory.allocUtf8String(name), parameterCount);
        return handle.isNull() ? null : new Il2Cpp.Method(handle);
    }

    /** Gets the nested class with the given name. */
    tryNested(name) {
        return this.nestedClasses.find(e => e.name == name);
    }

    /** */
    toString() {
        const declaringClass = this.declaringClass;
        return {
            'addr': this.handle,
            'name': (declaringClass ? declaringClass.name + "." : "") + this.name,
            'nameSpace': this.namespace
        };
    }

    show() {
        let field_array = []
        for (const field of this.fields) {
            const target = field.show();
            field_array.push(target);
        }
        let method_array = []
        for (const method of this.methods) {
            const target = method.show();
            method_array.push(target);
        }
        const inherited = [this.parent].concat(this.interfaces);
        return `\
// ${this.assemblyName}
${this.isEnum ? `enum` : this.isValueType ? `struct` : this.isInterface ? `interface` : `class`} \
${this.type.name}\
${inherited ? ` : ${inherited.map(e => e.type.name).join(`, `)}` : ``}
{
    ${field_array.join(`\n    `)}
    ${method_array.join(`\n    `)}
}`;
    }

    /** Executes a callback for every defined class. */
    static enumerate(block) {
        const callback = new NativeCallback(function (klass, _) {
            block(new Il2Cpp.Class(klass));
        }, "void", ["pointer", "pointer"]);
        return Il2Cpp.Api._classForEach(callback, NULL);
    }
};
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "actualInstanceSize", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "arrayClass", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "arrayElementSize", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "assemblyName", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "declaringClass", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "baseType", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "elementClass", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "fields", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "flags", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "genericParameterCount", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "hasReferences", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "hasStaticConstructor", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "image", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "instanceSize", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isAbstract", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isBlittable", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isEnum", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isGeneric", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isInflated", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isInterface", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "isValueType", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "interfaces", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "methods", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "name", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "namespace", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "nestedClasses", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "parent", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "rank", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "staticFieldsData", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "valueSize", null);
__decorate([
    decorator_cache_getter.cache
], Il2CppClass.prototype, "type", null);
__decorate([
    utils.levenshtein("fields")
], Il2CppClass.prototype, "field", null);
__decorate([
    utils.levenshtein("methods")
], Il2CppClass.prototype, "method", null);
__decorate([
    utils.levenshtein("nestedClasses")
], Il2CppClass.prototype, "nested", null);
Il2CppClass = __decorate([
    utils.cacheInstances
], Il2CppClass);
Il2Cpp.Class = Il2CppClass;
