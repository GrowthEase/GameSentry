require("../component");
const customize = require("./module/customize");
const lua_dump = require("./module/lua-dump");
const lua_hotfix = require("./module/lua-hotfix");
const base = require("./module/base");
const protobuf = require("./module/protocol-protobuf");
const log = require("./module/hook-log");
const func = require("./module/hook-function");
const field = require("./module/field");
const trace = require("./module/trace");
const show = require("./module/show");
const helper = require("./utils/helper");
const constants = require("./utils/constants");

rpc.exports = {
    il2cpp_init: il2cpp_init,
    il2cpp_list_image: il2cpp_list_image,
    il2cpp_list_class: il2cpp_list_class,
    il2cpp_list_method: il2cpp_list_method,
    il2cpp_list_field: il2cpp_list_field,
    il2cpp_hook_method: il2cpp_hook_method,
    il2cpp_hook_field: il2cpp_hook_field,
    il2cpp_search_class_instance: il2cpp_search_class_instance,
    il2cpp_load_custom_script: il2cpp_load_custom_script,
    il2cpp_function_detach: il2cpp_function_detach,
    il2cpp_injection_target_field: il2cpp_injection_target_field,
    il2cpp_resend_function: il2cpp_resend_function,
    il2cpp_send_function: il2cpp_send_function,
    il2cpp_list_field_instance: il2cpp_list_field_instance,
    il2cpp_trace_class: il2cpp_trace_class,
    il2cpp_close_trace: il2cpp_close_trace,
    il2cpp_show_class: il2cpp_show_class,
    engineName:engineName,
};

function engineName(){
    while (true){
        if(Process.findModuleByName("libil2cpp.so"))
            return "il2cpp"
        if(Process.findModuleByName("libcocos2djs.so"))
            return "cocos2djs"
        if(Process.findModuleByName("libcocos2dlua.so"))
            return "cocos2dlua"
        for (const module of Process.enumerateModules()) {
            if(module.name.startsWith("libmono"))
                return "mono"
        }
    }

}

function il2cpp_init(start_pb, start_log, start_lua, start_hotfix, target) {
    if (start_lua || start_hotfix) {
        const android_dlopen_ext = Module.findExportByName(null, "android_dlopen_ext");
        if (android_dlopen_ext != null) {
            const dlopen = Interceptor.attach(android_dlopen_ext, {
                onLeave: function (retval) {
                    module_xlua = Process.findModuleByName(constants.xlua_so);
                    if (module_xlua != null) {
                        dlopen.detach()
                        if (start_hotfix) {
                            lua_hotfix.hotfix_lua(target, module_xlua)
                        } else {
                            lua_dump.dump_lua(target, module_xlua)
                        }
                    }
                }
            });
        }
    }
    while (module_il2cpp == null) {
        module_il2cpp = Process.findModuleByName(constants.il2cpp_so);
    }
    attach_il2cpp(start_pb, start_log)
}

function attach_il2cpp(start_pb, start_log) {
    while (init_export == null) {
        init_export = module_il2cpp.findExportByName("il2cpp_init")
    }
    const interceptor = Interceptor.attach(init_export, {
        onLeave: function (ret) {
            interceptor.detach();
            helper.send_message("il2cpp_init", {"result": "success", "info": Process.findModuleByName("libil2cpp.so")})
            if (start_pb) {
                protobuf.parse_proto_class();
            }
            if (start_log) {
                log.hook_unity_log();
            }
        }
    });
}

function il2cpp_list_image() {
    helper.send_message("il2cpp_images", base.images());
}

function il2cpp_list_class(handle) {
    helper.send_message("il2cpp_classes", base.classes(handle));
}

function il2cpp_list_method(handle) {
    helper.send_message("il2cpp_class_methods", base.methods(handle));
}

function il2cpp_list_field(handle) {
    helper.send_message("il2cpp_class_fields", base.fields(handle));
}

function il2cpp_load_custom_script(script) {
    customize.il2cpp_load_custom_script(script);
}

function il2cpp_function_detach(handle) {
    base.detach(handle);
}

function il2cpp_injection_target_field(img_name, nameSpace, proto_class, fields, class_handle, hook_function_name) {
    protobuf.injection_proto_class(class_handle, hook_function_name, fields, proto_class, nameSpace, img_name);
}

function il2cpp_hook_method(method_handle, class_handle, method_type, class_name, nameSpace, img_name, method_name, parameters) {
    func.hook_unity_function(method_handle, class_handle, method_type, class_name, nameSpace, img_name, method_name, parameters);
}

function il2cpp_resend_function(method_handle, args_param) {
    func.resend_function(method_handle, args_param);
}

function il2cpp_send_function(method_handle, function_return_value, args_param) {
    func.send_function(method_handle, function_return_value, args_param);
}

function il2cpp_search_class_instance(class_handle) {
    field.search_class_instance(class_handle);
}

function il2cpp_list_field_instance(class_handle, instance_handle) {
    field.list_field_instance(class_handle, instance_handle);
}

function il2cpp_hook_field(field_handle, field_value, field_instance_handle) {
    field.hook_field(field_handle, field_value, field_instance_handle);
}

function il2cpp_trace_class(class_handle) {
    trace.trace_class(class_handle);
}

function il2cpp_close_trace(class_handle) {
    trace.il2cpp_close_trace(class_handle);
}

function il2cpp_show_class(class_handle) {
    show.show_class(class_handle)
}

let module_il2cpp;
let init_export;
let module_xlua;
