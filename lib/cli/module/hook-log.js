const helper = require("../utils/helper");
const constants = require("../utils/constants");

function hook_unity_log() {
    const coreModule = Il2Cpp.Domain.assembly("UnityEngine.CoreModule").image;
    const debug = coreModule.class('UnityEngine.Debug');
    const logger = coreModule.class('UnityEngine.Logger');
    debug.method("Log", 1).implementation = function (arg1) {
        helper.send_message("il2cpp_log", {'log': ptr(arg1).add(constants.p_size * 2 + 4).readUtf16String()})
        this.method("Log", 1).invoke(arg1);
    }

    logger.method("Log", 1).implementation = function (arg1) {
        helper.send_message("il2cpp_log", {'log': ptr(arg1).add(constants.p_size * 2 + 4).readUtf16String()})
        this.method("Log", 1).invoke(arg1);
    }
}

module.exports = {
    hook_unity_log
}
