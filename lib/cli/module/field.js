const helper = require("../utils/helper");
const base = require("./base");

function search_class_instance(class_handle) {
    const clazz = new Il2Cpp.Class(new NativePointer(class_handle));
    const matches = Il2Cpp.GC.choose(clazz);
    helper.send_message("il2cpp_class_instance", matches)
}

function list_field_instance(class_handle, class_instance) {
    const array = [];
    const clazz = new Il2Cpp.Class(new NativePointer(class_handle));
    for (const field of clazz.fields) {
        const target = field.toString();
        const field_type_enum = field.type.typeEnum;
        if (field_type_enum >= 2 && field_type_enum <= 14) {
            if (field.isStatic) {
                target['fieldValue'] = field.value.toString();
                target['valueAddress'] = 0;
            } else {
                const filed_address = new NativePointer(class_instance).add(field.offset);
                target['fieldValue'] = field.instanceGetValue(filed_address, field.type).toString();
                target['valueAddress'] = filed_address;
            }
            array.push(target);
        }
    }
    helper.send_message("il2cpp_class_fields", array)
}

function hook_field(field_handle, field_value, field_instance_handle) {
    const field = new Il2Cpp.Field(new NativePointer(field_handle));
    if (field.isStatic) {
        field.value(base.correction_input(field.type.typeEnum, field_value));
    } else {
        field.instanceSetValue(new NativePointer(field_instance_handle), base.correction_input(field.type.typeEnum, field_value));
    }
}

module.exports = {
    search_class_instance,
    list_field_instance,
    hook_field
}
