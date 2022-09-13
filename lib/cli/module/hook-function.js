const helper = require("../utils/helper");

function hook_unity_function(method_handle, class_handle, method_type, class_name, nameSpace, img_name, method_name, parameters) {
    const method = new Il2Cpp.Method(new NativePointer(method_handle));
    const clazz = new Il2Cpp.Class(new NativePointer(class_handle));
    method.implementation = function (...arg) {
        const fields = clazz.fields;
        let field_num = [];
        for (let field of fields) {
            const state = this.handle.add(field.offset);
            let value = null;
            const field_type_enum = field.type.typeEnum;
            if (field_type_enum >= 2 && field_type_enum <= 14) {
                if (field.isStatic) {
                    value = field.value.toString();
                } else {
                    value = field.instanceGetValue(state, field.type).toString();
                }
                field_num.push({
                    "name": field.name,
                    "type": field.type.name,
                    "value": value,
                    "isStatic": field.isStatic,
                })
            }
        }
        if (method_type == 'System.Void') {
            helper.send_message('il2cpp_hook_function_result',
                {
                    'addr': method.virtualAddress,
                    'class_name': class_name,
                    'nameSpace': nameSpace,
                    'img_name': img_name,
                    'method': method_name,
                    'param': functionParams(parameters, ...arg),
                    'field': field_num,
                    'return': ''

                });
            if (parameters == null) {
                method.invoke();
            } else {
                method.invoke(...arg);
            }
        } else {
            let return_value;
            if (parameters == null) {
                return_value = method.invoke();
            } else {
                return_value = method.invoke(...arg);
            }
            helper.send_message('il2cpp_hook_function_result',
                {
                    'addr': method.virtualAddress,
                    'class_name': class_name,
                    'nameSpace': nameSpace,
                    'img_name': img_name,
                    'method': method_name,
                    'param': functionParams(parameters, ...arg),
                    'field': field_num,
                    'return': return_value
                });
            return return_value;
        }
    }
}

function functionParams(parameters, ...arg) {
    let param_num = [];
    for (let param in parameters) {
        param_num.push({
            "name": parameters[param].name,
            "type": parameters[param].type,
            "value": arg[param],
        })
    }
    return param_num;
}

function resend_function(method_handle, args_param) {
    const method = new Il2Cpp.Method(new NativePointer(method_handle));
    const nativeFunction = new NativeFunction(method.virtualAddress, method.returnType.fridaAlias, method.fridaSignature);
    const args = [];
    for (let param in args_param) {
        args[args_param[param].index] = parseFloat(args_param[param].value) == 'NaN' ? args_param[param].value : parseFloat(args_param[param].value);
    }
    if (method.isStatic) {
        if (Il2Cpp.unityVersionIsBelow201830) {
            const env = Java.vm.tryGetEnv();
            if (args.length == 0) {
                nativeFunction(env);
            } else {
                nativeFunction(env, ...args);
            }
        } else {
            if (args.length == 0) {
                nativeFunction();
            } else {
                nativeFunction(...args);
            }
        }
    } else {
        const env = Java.vm.tryGetEnv();
        if (args.length == 0) {
            nativeFunction(env);
        } else {
            nativeFunction(env, ...args);
        }
    }
}

function send_function(method_handle, function_return_value, args_param) {
    const method = new Il2Cpp.Method(new NativePointer(method_handle));
    method.implementation = function (...arg) {
        if (function_return_value) {
            return parseFloat(function_return_value) == 'NaN' ? function_return_value : parseFloat(function_return_value);
        }
        for (let param in args_param) {
            arg[args_param[param].index] = parseFloat(args_param[param].value) == 'NaN' ? args_param[param].value : parseFloat(args_param[param].value);
        }
        return method.invoke(...arg);
    }
}

module.exports = {
    hook_unity_function,
    resend_function,
    send_function
}
