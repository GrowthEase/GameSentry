"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

/** Filtering utilities. */
class Il2CppFiltering {
    constructor() {
    }

    /** Creates a filter which includes `element`s whose type can be assigned to `klass` variables. */
    static Is(klass) {
        return (element) => {
            if (element instanceof Il2Cpp.Class) {
                return klass.isAssignableFrom(element);
            } else {
                return klass.isAssignableFrom(element.class);
            }
        };
    }

    /** Creates a filter which includes `element`s whose type corresponds to `klass` type. */
    static IsExactly(klass) {
        return (element) => {
            if (element instanceof Il2Cpp.Class) {
                return element.equals(klass);
            } else {
                return element.class.equals(klass);
            }
        };
    }
}

Il2Cpp.Filtering = Il2CppFiltering;
