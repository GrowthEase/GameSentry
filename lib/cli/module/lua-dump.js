const helper = require("../utils/helper");

function dump_lua(package_name, module_dlopen) {
    const app_path = `/data/data/${package_name}/luadump/`;
    Interceptor.attach(module_dlopen.findExportByName("luaL_loadbufferx"), {
        onEnter: function (args) {
            const name = Memory.readCString(args[3]);
            if (name.length < 50) {
                this.Path = name.substring(0, name.lastIndexOf("/"));
                this.file = name.substring(name.lastIndexOf("/") + 1, name.length);
                if (access(app_path + this.Path) == -1) {
                    folder_mkdirs(this.Path, app_path);
                }
                if (access(app_path + name) == 0) {
                    if (name != "chunk" && name != "Init") {
                        const data = read_lua(app_path + name);
                        args[2] = new NativePointer(ptr(data.size));
                        args[1].writeByteArray(data.data.readByteArray(data.size));
                        helper.send_message("unity_dump_lua_exist", {"name": name})
                    }
                } else {
                    lua_Dump(app_path + name, args[1], args[2].toInt32());
                }
            }
        }
    })
}

function lua_Dump(filePath, data, dataLen) {
    const dumpfile = new File(filePath, "wb");
    dumpfile.write(data.readByteArray(dataLen));
    dumpfile.close();
    helper.send_message("unity_dump_lua", {"filePath": filePath})
}

function access(filePath) {
    const ptr_access = Module.findExportByName("libc.so", "access");
    const func_access = new NativeFunction(ptr_access, 'int', ['pointer', 'int']);
    const ptr_filepath = Memory.allocUtf8String(filePath);
    return func_access(ptr_filepath, 0);
}

function mkdir(Path) {
    const ptr_mkdir = Module.findExportByName(null, "mkdir");
    const func_mkdir = new NativeFunction(ptr_mkdir, 'int', ['pointer', 'int']);
    const ptr_filepath = Memory.allocUtf8String(Path);
    return func_mkdir(ptr_filepath, 755);
}

function folder_mkdirs(p, app_path) {
    const p_list = p.split("/");
    let pp = app_path;
    for (let i = 0; i < p_list.length; i++) {
        pp = pp + "/" + p_list[i];
        if (access(pp) != 0) {
            mkdir(pp)
        }
    }
}

function read_lua(filePath) {
    const ptr_open = Module.findExportByName("libc.so", "open");
    const open = new NativeFunction(ptr_open, 'int', ['pointer', 'int']);
    const ptr_read = Module.findExportByName("libc.so", "read");
    const read = new NativeFunction(ptr_read, 'int', ['int', 'pointer', 'int']);
    const ptr_close = Module.findExportByName("libc.so", "close");
    const close = new NativeFunction(ptr_close, 'int', ['int']);
    const fd = open(Memory.allocUtf8String(filePath), 0);
    const size = get_file_size(fd);
    if (size > 0) {
        const data = Memory.alloc(size + 5);
        if (read(fd, data, size) < 0) {
            console.log('[+] Unable to read DLL [!] ' + filePath);
            close(fd);
            return 0;
        }
        close(fd);
        return {data: data, size: size};
    }
}

function get_file_size(fd) {
    const statBuff = Memory.alloc(500);
    const fstatSymbol = Module.findExportByName('libc.so', 'fstat');
    const fstat = new NativeFunction(fstatSymbol, 'int', ['int', 'pointer']);
    if (fd > 0) {
        const ret = fstat(fd, statBuff);
        if (ret < 0) {
            console.log('[+] fstat --> failed [!]');
        }
    }
    return Memory.readS32(statBuff.add(0x30));
}

module.exports = {
    dump_lua
}
