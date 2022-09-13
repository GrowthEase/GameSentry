"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

/** Represents a `ParameterInfo`. */
class Il2CppParameter {

    constructor(name, position, type) {
        this.name = name;
        this.position = position;
        this.type = type;
    }

    /** */
    toString() {
        return {
            "name": this.name,
            "type": this.type.name
        }
    }

    show() {
        return `${this.type.name} ${this.name}`;
    }
}

Il2Cpp.Parameter = Il2CppParameter;
