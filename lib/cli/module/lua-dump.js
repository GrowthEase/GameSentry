const helper = require("../utils/helper");
const utils = require("../utils/utils")

function dump_lua(package_name, module_dlopen,sendflag) {
    const app_path = `/data/data/${package_name}/luadump/`;
    Interceptor.attach(module_dlopen.findExportByName("luaL_loadbufferx"), {
        onEnter: function (args) {
            const name = Memory.readCString(args[3]);
            if (name.length < 50 && name.length > 0) {
                this.Path = name.substring(0, name.lastIndexOf("/"));
                this.file = name.substring(name.lastIndexOf("/") + 1, name.length);
                if (utils.access(app_path + this.Path) == -1) {
                    utils.folder_mkdirs(this.Path, app_path);
                }
                if (utils.access(app_path + name) == 0) {
                    if (name != "chunk" && name != "Init") {
                        const data = utils.readFile(app_path + name);
                        if(data.data == null){
                            helper.send_message("error","open "+app_path + name+" failed !")
                            return
                        }
                        args[2] = new NativePointer(ptr(data.size));
                        args[1].writeByteArray(data.data.readByteArray(data.size));
                        helper.send_message(sendflag, "load lua file :"+app_path + name)
                    }
                } else {
                    utils.Dump(app_path + name, args[1], args[2].toInt32());
                    helper.send_message(sendflag, "dump :"+app_path + name)
                }
            }
        }
    })
}

module.exports = {
    dump_lua
}
