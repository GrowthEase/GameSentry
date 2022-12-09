const helper = require("../utils/helper");
const utils = require("../utils/utils")

function dump_lua(package_name, module_dlopen) {
    const app_path = `/data/data/${package_name}/luadump/`;
    Interceptor.attach(module_dlopen.findExportByName("luaL_loadbufferx"), {
        onEnter: function (args) {
            const name = Memory.readCString(args[3]);
            if (name.length < 50) {
                this.Path = name.substring(0, name.lastIndexOf("/"));
                this.file = name.substring(name.lastIndexOf("/") + 1, name.length);
                if (utils.access(app_path + this.Path) == -1) {
                    utils.folder_mkdirs(this.Path, app_path);
                }
                if (utils.access(app_path + name) == 0) {
                    if (name != "chunk" && name != "Init") {
                        const data = utils.readFile(app_path + name);
                        args[2] = new NativePointer(ptr(data.size));
                        args[1].writeByteArray(data.data.readByteArray(data.size));
                        helper.send_message("unity_dump_lua_exist", {"name": name})
                    }
                } else {
                    utils.Dump(app_path + name, args[1], args[2].toInt32());
                }
            }
        }
    })
}

module.exports = {
    dump_lua
}
