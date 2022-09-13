const base = require("./base");

function trace_class(class_handle) {
    Il2Cpp.trace()
        .classes(new Il2Cpp.Class(new NativePointer(class_handle)))
        .and()
        .attach("detailed");
}

function il2cpp_close_trace(class_handle) {
    const clazz = new Il2Cpp.Class(new NativePointer(class_handle));
    for (const method of clazz.methods) {
        base.detach(method.virtualAddress);
    }
}

module.exports = {
    trace_class,
    il2cpp_close_trace
}
