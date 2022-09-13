const helper = require("../utils/helper");
const base = require("./base");

function parse_proto_class() {
    let message;
    let is_pb;
    proto_class:
        for (const assembly of base.assemblies()) {
            for (const clazz of assembly.image.classes) {
                if (clazz.name === 'IMessage' && clazz.namespace === 'Google.Protobuf') {
                    message = clazz;
                    is_pb = true;
                    break proto_class;
                }
                if (clazz.name === 'IExtensible' && clazz.namespace.indexOf("ProtoBuf") != -1) {
                    message = clazz;
                    is_pb = true;
                    break proto_class;
                }
            }
        }
    if (!is_pb) {
        console.log("there is no pb, please check it")
        return;
    }
    try {
        for (const assembly of base.assemblies()) {
            for (const clazz of assembly.image.classes) {
                const isSubIMessage = clazz.isSubclassOf(message, 1)
                if (isSubIMessage) {
                    hook_proto_class(clazz, clazz.name, clazz.namespace, assembly.image.name)
                }
            }
        }
    } catch (e) {
        console.log(e.toString())
    }
}

let hook_function_name

function hook_proto_class(clazz, name, namespace, imageName) {
    if (clazz.fieldsNum == 0 || name == "IMessage`1") {
        return;
    }
    if (!hook_function_name) {
        const hook_function = find_function(clazz);
        if (hook_function == undefined) {
            return;
        }
        hook_function_name = hook_function.name
    }
    clazz.method(hook_function_name).implementation = function (args) {
        const fieldsInfo = [];
        for (let field of clazz.fields) {
            const state = this.handle.add(field.offset);
            const field_name = field.name;
            const field_type_enum = field.type.typeEnum;
            if (field_type_enum >= 2 && field_type_enum <= 14 && field_name !== '_parser' && !field_name.endsWith("FieldNumber")) {
                fieldsInfo.push({
                    'name': escape(field_name),
                    'value': field.instanceGetValue(state).toString(),
                    'handle': field.handle
                });
            }
        }
        if (fieldsInfo.length > 0) {
            helper.send_message('il2cpp_proto_classes_result',
                {
                    'proto_class': name,
                    'class_addr': clazz.handle,
                    'addr': this.method(hook_function_name).virtualAddress,
                    'img_name': imageName,
                    'nameSpace': namespace,
                    'field': fieldsInfo,
                    'hook_function_name': hook_function_name,
                }
            );
        }
        return this.method(hook_function_name).invoke(args);
    }
}

function find_function(clazz) {
    return clazz.methods.find(e => e.name == "ProtoBuf.IExtensible.GetExtensionObject"
        || e.name == "Encode"
        || e.name == "WriteTo");
}

function injection_proto_class(class_handle, hook_function_name, fields, name, namespace, imageName) {

    const clazz = new Il2Cpp.Class(new NativePointer(class_handle));
    clazz.method(hook_function_name).implementation = function (args) {
        for (let i = 0; i < fields.length; i++) {
            const item = fields[i];
            const field_value = item['value'];
            const field = new Il2Cpp.Field(new NativePointer(item["handle"]));
            const state = this.handle.add(field.offset);
            field.instanceSetValue(state, base.correction_input(field.type.typeEnum, field_value))
        }

        const fieldsInfo = [];
        for (let field of clazz.fields) {
            const state = this.handle.add(field.offset);
            const field_name = field.name;
            const field_type_enum = field.type.typeEnum;
            if (field_type_enum >= 2 && field_type_enum <= 14 && field_name !== '_parser' && !field_name.endsWith("FieldNumber")) {
                fieldsInfo.push({
                    'name': escape(field_name),
                    'value': field.instanceGetValue(state).toString(),
                    'handle': field.handle
                });
            }
        }
        if (fieldsInfo.length > 0) {
            helper.send_message('il2cpp_proto_classes_result',
                {
                    'proto_class': name,
                    'class_addr': clazz.handle,
                    'addr': this.method(hook_function_name).virtualAddress,
                    'img_name': imageName,
                    'nameSpace': namespace,
                    'field': fieldsInfo,
                    'hook_function_name': hook_function_name,
                }
            );
        }
        return this.method(hook_function_name).invoke(args);
    }
}

module.exports = {
    parse_proto_class,
    injection_proto_class
}
