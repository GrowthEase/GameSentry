const lua_dump = require("../cli/module/lua-dump");


function  cocos_lua_init(package_name){
    let libcocos2dlua = Process.findModuleByName("libcocos2dlua.so");
    lua_dump.dump_lua(package_name,libcocos2dlua,"cocos_lua")
}

module.exports = {
    cocos_lua_init
}