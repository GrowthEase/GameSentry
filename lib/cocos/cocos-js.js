const utils = require("../cli/utils/utils");
const helper = require("../cli/utils/helper");

function dump_and_replace_js(package_name){
    console.log(package_name)
    const app_path = `/data/data/${package_name}/jsdump/`;
    helper.send_message("cocos_js_dump", "dump path :"+app_path);
    utils.mkdir(app_path)
    let exports = Module.enumerateExports("libcocos2djs.so");
    let evalString = null;
    for(let exfunc of exports){
        // console.log(exfunc.name)
        if(exfunc.name.indexOf("evalString")!= -1 && exfunc.name.indexOf("Cocos2dxJavascriptJavaBridge") == -1){
            evalString = exfunc.address;
            // console.log("hi evalString:"+JSON.stringify(exfunc))
            helper.send_message("cocos_js_dump", "evalString:"+JSON.stringify(exfunc));
            Interceptor.attach(evalString,{
                onEnter:function (args) {

                    let codeData = args[1].readCString();
                    let codeSize = args[2];
                    let pathName = args[4].readCString();
                    console.log(pathName)
                    this.Path = pathName.substring(0, pathName.lastIndexOf("/"));
                    this.file = pathName.substring(pathName.lastIndexOf("/") + 1, pathName.length);
                    if (utils.access(app_path + this.Path) == -1) {
                        utils.folder_mkdirs(this.Path, app_path);
                    }
                    if (utils.access(app_path + pathName) == 0){
                        const data = utils.readFile(app_path + pathName);
                        args[2] = new NativePointer(ptr(data.size));
                        args[1].writeByteArray(data.data.readByteArray(data.size));
                        helper.send_message("cocos_js_dump", "replace_name:"+pathName)
                    } else {
                        utils.Dump(app_path + pathName, args[1], args[2].toInt32());
                        helper.send_message("cocos_js_dump", "dump_name:"+ pathName)
                    }

                }
            })
        }
    }
    // if(evalString!=null){
    //     Interceptor.attach(evalString,{
    //         onEnter:function (args) {
    //
    //             let codeData = args[1].readCString();
    //             let codeSize = args[2];
    //             let pathName = args[4].readCString();
    //             if (utils.access(app_path + this.Path) == -1) {
    //                 utils.folder_mkdirs(this.Path, app_path);
    //             }
    //             console.log(pathName)
    //         }
    //     })
    // }
}
module.exports = {
    dump_and_replace_js
}




