const helper = require("../utils/helper");
var lua_State = null
var pthread_create, luaL_loadstring, lua_pcall, lua_tolstring
var LUA_PATH


var LuaFileWatcherNative = new NativeCallback(LuaFileWatcher, 'void', ['void'])

function hotfix_lua(package_name, module) {
    LUA_PATH = '/data/data/' + package_name + '/luadump'
    helper.send_message("HotFix_Init", module)

    Interceptor.attach(Module.findExportByName("libxlua.so", "luaL_openlibs"), {
        onEnter: function (args) {
            console.log("lua_State:" + args[0])
            lua_State = ptr(args[0])
            luaL_loadstring = new NativeFunction(Module.findExportByName("libxlua.so", "luaL_loadstring"), 'int', ['pointer', 'pointer'])
            lua_pcall = new NativeFunction(Module.findExportByName("libxlua.so", "lua_pcall"), 'int', ['pointer', 'int', 'int', 'int'])
            lua_tolstring = new NativeFunction(Module.findExportByName("libxlua.so", "lua_tolstring"), 'pointer', ['pointer', 'int'])
        }, onLeave: function (ret) {
        }
    });

    pthread_create = new NativeFunction(Module.findExportByName(null, "pthread_create"), 'int', ['pointer', 'pointer', 'pointer', 'pointer'])
    //启动新线程对目标目录进行文件监控。
    var ret = pthread_create(Memory.alloc(16), new NativePointer(0), LuaFileWatcherNative, new NativePointer(0))
    if (ret == 0)
        helper.send_message("HotFix_Init", "init success")
    helper.send_message("HotFix_Init", "ret:" + ret)
}

function LuaFileWatcher() {
    var inotify_init = new NativeFunction(Module.findExportByName(null, "inotify_init"), 'int', [])
    var inotify_add_watch = new NativeFunction(Module.findExportByName(null, "inotify_add_watch"), 'int', ['int', 'pointer', 'int'])
    const read = new NativeFunction(Module.findExportByName(null, "read"), 'int', ['int', 'pointer', 'int']);
    var fd = inotify_init()
    helper.send_message("HotFix_Init", "LuaFileWatcher run ")
    var wd = inotify_add_watch(fd, Memory.allocUtf8String(LUA_PATH), 256) //ALL_EVENTS = 4095,OPEN=32
    const inotify_event_len = 0x10
    var data = Memory.alloc(inotify_event_len * 10);
    while (1) {
        let readlen = read(fd, data, inotify_event_len * 10 - 1)
        if (readlen < 0) {
            console.log('[+] Unable to read  [!] ');
            continue
        }
        console.log(readlen, data)

        // struct inotify_event {
        //     __s32 wd;
        //     __u32 ;
        //     __u32 cookie;
        //     __u32 len;
        //     char name[0];
        // };
        for (let i = 0; i < (readlen / 0x10) - 1; i++) {
            let readData = data.add(i * 0x10)
            let envent = []
            envent.wd = readData.readS32();
            envent.mask = readData.add(4).readU32();
            envent.cookie = readData.add(8).readU32();
            envent.len = readData.add(12).readU32();
            envent.name = readData.add(16).readCString();
            // console.log('open file : ',envent.name,envent.mask)
            helper.send_message("HotFix_Init", 'open file : ' + envent.name + ' ' + envent.mask)
            if (envent.mask != 256)
                continue;
            try {
                console.log('----------------------')
                let luaname = envent.name.replaceAll("_", ".")
                console.log("luaname" + luaname)
                var scr = 'if string.find(package.path,\"' + LUA_PATH + '\") == nil then\n' +
                    '    package.path = package.path .. \";' + LUA_PATH + '/?\"\n' +
                    'end\n' +
                    'require(\"HotFixYiDun\")\n' +
                    'hotfix(\"' + luaname + '\")'
                console.log(scr)
                var luaL_loadstring_ret = luaL_loadstring(lua_State, Memory.allocUtf8String(scr))
                console.log("luaL_loadstring_ret  : " + luaL_loadstring_ret)
                console.log("load lua init ret " + lua_pcall(lua_State, 0, 0, 0) + "  str:" + lua_tolstring(lua_State, -1).readCString())

            } catch (e) {
                console.log("err:" + e.toString())
            }

        }

    }

}


module.exports = {
    hotfix_lua
}

