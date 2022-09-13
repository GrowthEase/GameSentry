const helper = require("../utils/helper");
function il2cpp_load_custom_script(script) {
    const func = new Function(script);
    try{
        func();
    }catch (e) {
        helper.send_message("heap_search",e.toString())
    }

}

module.exports = {
    il2cpp_load_custom_script
}
