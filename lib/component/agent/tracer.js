"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
const console = require("../utils/console");
const utils = require("./utils");

/** Tracing utilities. */
class Il2CppTracer {

    domain() {
        return this;
    }

    assemblies(...assemblies) {
        this.assemblies_all = assemblies;
        return this;
    }

    classes(...classes) {
        this.classes_all = classes;
        return this;
    }

    methods(...methods) {
        this.methods_all = methods;
        return this;
    }

    filterAssemblies(filter) {
        this.assemblyFilter = filter;
        return this;
    }

    filterClasses(filter) {
        this.classFilter = filter;
        return this;
    }

    filterMethods(filter) {
        this.methodFilter = filter;
        return this;
    }

    filterParameters(filter) {
        this.parameterFilter = filter;
        return this;
    }

    and() {
        this.targets = [];
        const filterMethod = (method) => {
            if (this.parameterFilter == undefined) {
                this.targets.push(method);
                return;
            }
            for (const parameter of method.parameters) {
                if (this.parameterFilter(parameter)) {
                    this.targets.push(method);
                    break;
                }
            }
        };
        const filterMethods = (values) => {
            for (const method of values) {
                filterMethod(method);
            }
        };
        const filterClass = (klass) => {
            if (this.methodFilter == undefined) {
                filterMethods(klass.methods);
                return;
            }
            for (const method of klass.methods) {
                if (this.methodFilter(method)) {
                    filterMethod(method);
                }
            }
        };
        const filterClasses = (values) => {
            for (const klass of values) {
                filterClass(klass);
            }
        };
        const filterAssembly = (assembly) => {
            if (this.classFilter == undefined) {
                filterClasses(assembly.image.classes);
                return;
            }
            for (const klass of assembly.image.classes) {
                if (this.classFilter(klass)) {
                    filterClass(klass);
                }
            }
        };
        const filterAssemblies = (assemblies) => {
            for (const assembly of assemblies) {
                filterAssembly(assembly);
            }
        };
        const filterDomain = (domain) => {
            if (this.assemblyFilter == undefined) {
                filterAssemblies(domain.assemblies);
                return;
            }
            for (const assembly of domain.assemblies) {
                if (this.assemblyFilter(assembly)) {
                    filterAssembly(assembly);
                }
            }
        };
        this.methods_all
            ? filterMethods(this.methods_all)
            : this.classes_all
                ? filterClasses(this.classes_all)
                : this.assemblies_all
                    ? filterAssemblies(this.assemblies_all)
                    : filterDomain(Il2Cpp.Domain);
        this.assemblies_all = undefined;
        this.classes_all = undefined;
        this.methods_all = undefined;
        this.assemblyFilter = undefined;
        this.classFilter = undefined;
        this.methodFilter = undefined;
        this.parameterFilter = undefined;
        return this;
    }

    attach(mode = "full") {
        let count = 0;
        for (const target of this.targets) {
            if (target.virtualAddress.isNull()) {
                continue;
            }
            const offset = `\x1b[2m0x${target.relativeVirtualAddress.toString(16).padStart(8, `0`)}\x1b[0m`;
            const fullName = `${target.class.type.name}.\x1b[1m${target.name}\x1b[0m`;
            if (mode == "detailed") {
                const startIndex = +!target.isStatic | +Il2Cpp.unityVersionIsBelow201830;
                const callback = (...args) => {
                    const thisParameter = target.isStatic ? undefined : new Il2Cpp.Parameter("this", -1, target.class.type);
                    const parameters = thisParameter ? [thisParameter].concat(target.parameters) : target.parameters;
                    console.out(`\
${offset} ${`│ `.repeat(count++)}┌─\x1b[35m${fullName}\x1b[0m(\
${parameters.map(e => `\x1b[32m${e.name}\x1b[0m = \x1b[31m${utils.fromFridaValue(args[e.position + startIndex], e.type)}\x1b[0m`).join(`, `)});`);
                    const new_function = new NativeFunction(target.virtualAddress, target.returnType.fridaAlias, target.fridaSignature)
                    const returnValue = new_function(...args);
                    console.out(`\
${offset} ${`│ `.repeat(--count)}└─\x1b[33m${fullName}\x1b[0m\
${returnValue == undefined ? `` : ` = \x1b[36m${utils.fromFridaValue(returnValue, target.returnType)}`}\x1b[0m;`);
                    return returnValue;
                };
                try {
                    target.revert();
                    const nativeCallback = new NativeCallback(callback, target.returnType.fridaAlias, target.fridaSignature);
                    Interceptor.replace(target.virtualAddress, nativeCallback);
                } catch (e) {
                }
            } else {
                try {
                    Interceptor.attach(target.virtualAddress, {
                        onEnter: () => console.out(`${offset} ${`│ `.repeat(count++)}┌─\x1b[35m${fullName}\x1b[0m`),
                        onLeave: () => console.out(`${offset} ${`│ `.repeat(--count)}└─\x1b[33m${fullName}\x1b[0m${count == 0 ? `\n` : ``}`)
                    });
                } catch (e) {
                }
            }
        }
    }
}

Il2Cpp.Tracer = Il2CppTracer;
