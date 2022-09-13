const helper = require("../utils/helper");

function show_class(class_handle) {
    helper.send_message("show_class", new Il2Cpp.Class(new NativePointer(class_handle)).show())
}

module.exports = {
    show_class
}
