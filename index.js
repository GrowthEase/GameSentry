const express = require("express")
const bodyParser = require('body-parser')
const frida = require('frida')
const load = require('frida-load')
const fs = require('fs')
const moment = require('moment')
const {exec} = require('child_process')
const nunjucks = require('nunjucks')
const path = require("path")
const socket_io = require('socket.io');
const http = require('http');

const static_path = __dirname + "/res/static"
const template_path = __dirname + "/res/templates"
const app = express()
const server = http.createServer(app);
const io = socket_io(server);
app.set('socket_io', io);
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static(static_path))
nunjucks.configure(template_path, {
    autoescape: true,
    watch: true,
    express: app
})
server.listen(5000, () => {
    console.log("Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)")
})

let isConnect = false
io.on('connection', (socket) => {
    console.log('Socket connected');
    isConnect = true
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
        isConnect = false
    });
});

/**
 * 获取所有Image
 */
app.get("/images", async function (req, res) {
    if (allImages.length != 0) {
        res.send(allImages)
    } else {
        await il2cpp_list_image()
        const report_data = fs.readFileSync(report_path, 'utf8')
        allImages = report_data
        res.send(report_data)
    }
})

/**
 * 获取指定Image的所有Class
 */
app.post("/classes", async function (req, res) {
    const image_addr = req.body.addr
    const class_item = getItem(allClasses, "addr", image_addr)
    if (class_item) {
        res.send(class_item.data)
    } else {
        await il2cpp_list_class(image_addr)
        const report_data = fs.readFileSync(report_path, 'utf8')
        allClasses.push({
            "addr": image_addr,
            "data": report_data
        })
        res.send(report_data)
    }
})

/**
 * 获取指定Class的所有methods
 */
app.post("/methods", async function (req, res) {
    const class_addr = req.body.addr
    const method_item = getItem(allMethods, "addr", class_addr)
    if (method_item) {
        res.send(method_item.data)
    } else {
        await il2cpp_list_method(class_addr)
        const report_data = fs.readFileSync(report_path, 'utf8')
        allMethods.push({
            "addr": class_addr,
            "data": report_data
        })
        res.send(report_data)
    }
})

/**
 * 获取指定Class的所有fields
 */
app.post("/fields", async function (req, res) {
    const class_addr = req.body.addr
    const class_instance = req.body.class_instance
    await il2cpp_list_field(class_addr, class_instance)
    res.send(fs.readFileSync(report_path, 'utf8'))
})

/**
 * 获取实例下的所有fields
 */
app.post("/fields_instance", async function (req, res) {
    const class_addr = req.body.addr
    const class_instance = req.body.class_instance
    await il2cpp_list_field_instance(class_addr, class_instance)
    res.send(fs.readFileSync(report_path, 'utf8'))
})

/**
 * 执行自定义的文本。注意：数据仅展示最后一条send数据
 */
app.post("/load_frida_script", async function (req, res) {
    await il2cpp_load_custom_script(req.body.frida_custom_script)
    res.send({"result": "success"})
})

/**
 * 重启
 */
app.get("/restart", async function (req, res) {
    await init()
    res.send({"result": "success"})
})

/**
 * hook静态属性进行修改
 */
app.post("/hook_field", async function (req, res) {
    await il2cpp_hook_field(req.body.addr, req.body.value, req.body.instance_addr)
    res.send({"result": "success"})
})

/**
 * 实例获取
 */
app.post("/search_class_instance", async function (req, res) {
    await il2cpp_search_class_instance(req.body.addr)
    res.send(fs.readFileSync(report_path, 'utf8'))
})

/**
 * 函数重发
 */
app.post("/resend_function", async function (req, res) {
    await il2cpp_resend_function(req.body.addr, req.body.args_param)
    res.send({"result": "success"})
})

/**
 * 函数修改发送
 */
app.post("/send_function", async function (req, res) {
    await il2cpp_send_function(req.body.addr, req.body.function_return_value, req.body.args_param)
    res.send({"result": "success"})
})

/**
 * 主界面
 */
app.get("/", async function (req, res) {
    const device = await frida.getUsbDevice()
    const applications = await device.enumerateApplications()
    let template = {
        app_list: applications,
    }
    res.render("device.html", template)
})

/**
 * 功能界面
 */
app.post("/index", async function (req, res) {
    res_start = res
    const target_package = req.body.package
    target = target_package.substring(0, target_package.indexOf("---"))
    start_pb = JSON.parse(req.body.protobuf)
    start_log = JSON.parse(req.body.log)
    start_lua = JSON.parse(req.body.lua)
    start_hotfix = JSON.parse(req.body.hotfix)
    if (start_lua && start_hotfix) {
        res.send({"result": "fail", "data": "热更lua与dump lua不能同时开启"})
        return
    }
    await init()
})

/**
 * 协议内存修改
 */
app.post("/injection_field", async function (req, res) {
    await il2cpp_injection_target_field(req.body.img_name, req.body.nameSpace, req.body.proto_class, req.body.fields, req.body.class_handle, req.body.hook_function_name)
    res.send({"result": "success"})
})

/**
 * 函数解绑
 */
app.post("/function_detach", async function (req, res) {
    await il2cpp_function_detach(req.body.addr)
    res.send({"result": "success"})
})

/**
 * 函数hook
 */
app.post("/hook_method_info", async function (req, res) {
    await il2cpp_hook_method(req.body.method_handle, req.body.class_handle, req.body.method_type, req.body.class_name, req.body.nameSpace, req.body.img_name, req.body.method_name, req.body.parameters)
    res.send({"result": "success"})
})

/**
 * lua dump反编译接口
 */
app.get("/dump_lua", async function (req, res) {
    dump_lua()
    res.send({"result": "success"})
})

/**
 * lua 解密接口
 */
app.get("/dump_lua_decrypt", async function (req, res) {
    dump_lua_decrypt()
    res.send({"result": "success"})
})

/**
 * lua 迁移接口 所有功能完成之后进行文件迁移 修改
 */
app.post("/revise_lua", async function (req, res) {
    revise_lua(req.body.lua_path, req.body.file_name)
    res.send({"result": "success"})
})

/**
 * 函数跟踪
 */
app.post("/trace_class", async function (req, res) {
    await il2cpp_trace_class(req.body.class_handle)
    res.send({"result": "success"})
})

/**
 * 关闭函数跟踪
 */
app.post("/close_trace", async function (req, res) {
    await il2cpp_close_trace(req.body.class_handle)
    res.send({"result": "success"})
})

/**
 * 展示class信息
 */
app.post("/show_class", async function (req, res) {
    const class_handle = req.body.class_handle
    await il2cpp_show_class(class_handle)
    res.send(fs.readFileSync(report_path, 'utf8'))
})

process.on('uncaughtException', function (err) {
    console.log(err)
    console.log(err.stack)
})

function exec_output(data) {
    exec(data, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
            return
        }
        console.log(`exec stdout: ${stdout}`)
        console.error(`exec stderr: ${stderr}`)
    })
    writeFile(data)
}

async function init() {
    if (!fs.existsSync('log')) {
        fs.mkdirSync('log')
    }
    if (start_lua) {
        exec_output('adb root')
    }
    if (start_hotfix) {
        adb_push(target, __dirname + "\\lib\\cli\\module\\HotFixYiDun.lua", "/HotFixYiDun")
    }
    const device = await frida.getUsbDevice()
    const pid = await device.spawn(target)
    const session = await device.attach(pid)
    const frida_agent = await load(require.resolve(agent_path))
    const script = await session.createScript(frida_agent)
    device.processCrashed.connect(onProcessCrashed)
    session.detached.connect(onSessionDetached)
    script.message.connect(onMessage)
    await script.load()
    api = script.exports
    await device.resume(pid)

    let engineName = await api.engineName()
    console.log('\033[40;35m engineName: \x1b[45;97m'+engineName+'\033[40;35m init start! \033[0m');
    if(engineName == "il2cpp"){
        await api.il2cpp_init(start_pb, start_log, start_lua, start_hotfix, target)
    }
    else if(engineName == "cocos2djs"){
        await api.cocos_js_dump_replace(target)
        res_start.render("cocos_main.html",{})

    }
        // else if(engineName == "cocos2dlua"){
        //
        // }else if(engineName == "mono"){
        //
        // }
    else {
        res_start.send("不支持的游戏引擎！")
    }
}

async function il2cpp_list_image() {
    await api.il2cpp_list_image()
}

async function il2cpp_list_class(addr) {
    await api.il2cpp_list_class(addr)
}

async function il2cpp_list_method(addr) {
    await api.il2cpp_list_method(addr)
}

async function il2cpp_list_field(addr, class_instance) {
    await api.il2cpp_list_field(addr, class_instance)
}

async function il2cpp_show_class(addr) {
    await api.il2cpp_show_class(addr)
}

async function il2cpp_list_field_instance(addr, class_instance) {
    await api.il2cpp_list_field_instance(addr, class_instance)
}

async function il2cpp_search_class_instance(addr) {
    await api.il2cpp_search_class_instance(addr)
}

async function il2cpp_load_custom_script(script) {
    await api.il2cpp_load_custom_script(script)
}

async function il2cpp_hook_field(addr, value, instance_addr) {
    await api.il2cpp_hook_field(addr, value, instance_addr)
}

async function il2cpp_resend_function(addr, args_param) {
    await api.il2cpp_resend_function(addr, args_param)
}

async function il2cpp_send_function(addr, function_return_value, args_param) {
    await api.il2cpp_send_function(addr, function_return_value, args_param)
}

async function il2cpp_function_detach(addr) {
    await api.il2cpp_function_detach(addr)
}

async function il2cpp_injection_target_field(img_name, nameSpace, proto_class, fields, class_handle, hook_function_name) {
    await api.il2cpp_injection_target_field(img_name, nameSpace, proto_class, fields, class_handle, hook_function_name)
}

async function il2cpp_hook_method(method_handle, class_handle, method_type, class_name, nameSpace, img_name, method_name, parameters) {
    await api.il2cpp_hook_method(method_handle, class_handle, method_type, class_name, nameSpace, img_name, method_name, parameters)
}

async function il2cpp_trace_class(class_handle) {
    await api.il2cpp_trace_class(class_handle)
}

async function il2cpp_close_trace(class_handle) {
    await api.il2cpp_close_trace(class_handle)
}

function dump_lua() {
    const app_path = `/data/data/${target}/luadump`
    exec_output(`adb shell "su -c 'chmod 755 ${app_path}'"`)
    delete_all('./tools/unlua')
    delete_all('./tools/loadump')
    exec_output('adb pull data/data/' + target + '/luadump/ ' + __dirname + '/tools')
}

function revise_lua(lua_path, file_name) {
    if (start_lua) {
        adb_push(target, lua_path, "/" + file_name)
    }
    if (start_hotfix) {
        file_name = file_name.replaceAll("@", "").replaceAll(".", "_").replaceAll("/", "_")
        adb_push(target, lua_path, "/" + file_name)
    }
}

function delete_lua(package_name) {
    const app_path = `/data/data/${package_name}/luadump`
    exec_output(`adb shell "su -c 'rm -r ${app_path}'"`)
}

function adb_push(package_name, lua_path, end_name) {
    const app_path = ` /data/data/${package_name}/luadump`
    exec_output('adb push ' + lua_path + app_path + end_name)
}

function delete_all(path) {
    let files = []
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path)
        files.forEach(function (file, index) {
            const curPath = path + "/" + file
            if (fs.statSync(curPath).isDirectory()) {
                delete_all(curPath)
            } else {
                fs.unlinkSync(curPath)
            }
        })
        fs.rmdirSync(path)
    }
}

function walk_sync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        const filePath = path.join(currentDirPath, name)
        const stat = fs.statSync(filePath)
        if (stat.isFile()) {
            callback(filePath, stat)
        } else if (stat.isDirectory()) {
            walk_sync(filePath, callback)
        }
    })
}

function dump_lua_decrypt() {
    if (!fs.existsSync('./tools/unlua')) {
        fs.mkdirSync('./tools/unlua')
    }
    walk_sync('./tools/luadump', function (filePath, stat) {
        if (filePath !== 'tools\\luadump\\chunk' && filePath !== 'tools\\luadump\\Init') {
            const dump_path = filePath.substring(14)
            const sub_path = dump_path.substring(0, dump_path.lastIndexOf("\\"))
            let make_path = "./tools/unlua/"
            sub_path.split("\\").forEach(function (file, index) {
                make_path += file + "/"
                if (!fs.existsSync(make_path)) {
                    fs.mkdirSync(make_path)
                }
            })
            exec_output('java -jar ' + __dirname + "\\tools\\lua\\" + "unluac.jar " + __dirname + "\\" + filePath + " > " + __dirname + "\\" + filePath.replace("tools\\luadump\\", "tools\\unlua\\"))
        }
    })
}

function onMessage(message, data) {
    if (!message.payload) {
        console.log("---oops---")
        console.log(message)
        return
    }
    const func = message.payload.function
    if (!func) {
        io_handler('heap_search', message.payload)
        writeFile(message.payload)
        return
    }
    const value = message.payload.value
    switch (func) {
        case "heap_search":
            io_handler('heap_search', value)
            writeFile(message.payload)
            break
        case "il2cpp_init":
            writeFile(value)
            res_start.render("main.html", {})
            break
        case "il2cpp_log":
            io_handler(func, value.log)
            writeOtherFile(JSON.stringify(value), il2cpp_log_path)
            break
        case "il2cpp_proto_classes_result":
            io_handler(func, value)
            writeOtherFile(JSON.stringify(value), proto_classes_path)
            break
        case "il2cpp_images":
            writeFileReport(value)
            writeOtherFile(JSON.stringify(value), il2cpp_images_path)
            break
        case "il2cpp_class_instance":
            writeFileReport(value)
            writeOtherFile(JSON.stringify(value), il2cpp_class_instance_path)
            break
        case "il2cpp_classes":
            writeFileReport(value)
            writeOtherFile(JSON.stringify(value), il2cpp_classes_path)
            break
        case "il2cpp_class_methods":
            writeFileReport(value)
            writeOtherFile(JSON.stringify(value), il2cpp_class_methods_path)
            break
        case "il2cpp_class_fields":
            writeFileReport(value)
            writeOtherFile(JSON.stringify(value), il2cpp_class_fields_path)
            break
        case "unity_dump_lua":
            writeOtherFile(JSON.stringify(value), unity_dump_lua_path)
            break
        case "unity_dump_lua_exist":
            writeOtherFile(JSON.stringify(value), unity_dump_lua_exist_path)
            break
        case "il2cpp_hook_function_result":
            io_handler(func, value)
            writeOtherFile(JSON.stringify(value), il2cpp_hook_function_result_path)
            break
        case "il2cpp_trace_function":
            io_handler(func, value)
            writeOtherFile(value, il2cpp_trace_function_path, true)
            break
        case "show_class":
            writeFileReport(value)
            writeOtherFile(JSON.stringify(value), il2cpp_show_class_path)
            break
        case "cocos_js_dump":

            if(isConnect){
                skt.timeout(2000).emit('cocos_js_dump', value)
            }else {
                console.log('\033[40;35m '+value+' \033[0m');
                const currentTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
                const param = currentTime + '\r\n' + data + '\r\n'
                fs.writeFileSync(cocos_js_dump_log_path, param, {flag: 'a'})
            }

            // writeOtherFile(value+"\n", cocos_js_dump_log_path)
            break
        default:
            writeFileReport(value)
            writeFile(value)
            break
    }
}

function io_handler(func, data) {
    io.emit(
        func,
        {
            'data': JSON.stringify(data)
        },
    )
}

function writeOtherFile(data, file_path, is_trace) {
    if (!data) {
        console.log("data is null")
        return
    }
    if (is_trace) {
        fs.writeFileSync(file_path, data + '\r\n', {flag: 'a'})
        return;
    }
    console.log(data)
    const currentTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    const param = currentTime + '\r\n' + data + '\r\n'
    fs.writeFileSync(file_path, param, {flag: 'a'})
}

function writeFile(data) {
    if (!data) {
        console.log("data is null")
        return
    }
    console.log(JSON.stringify(data))
    const currentTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
    const param = currentTime + '\r\n' + JSON.stringify(data) + '\r\n'
    fs.writeFileSync(logger_path, param, {flag: 'a'})
}

function writeFileReport(data) {
    if (!data) {
        return
    }
    fs.writeFileSync(report_path, JSON.stringify(data))
}

function getItem(arr, n, v) {
    for (let i = 0; i < arr.length; i++)
        if (arr[i][n] == v) {
            return arr[i]
        }
}

function onProcessCrashed(crash) {
    writeFile('[*] onProcessCrashed() crash:' + crash)
}

function onSessionDetached(reason, crash) {
    writeFile('[*] onSessionDetached() reason:' + reason, 'crash:' + crash)
}

let allClasses = []
let allImages = []
let allMethods = []
let res_start = null
let api = null
let target = null
let start_pb = false
let start_log = false
let start_lua = false
let start_hotfix = false
const agent_path = __dirname + "/lib/cli/" + "index.js"
const report_path = __dirname + "/log/" + "report.txt"
const logger_path = __dirname + "/log/" + "logger.txt"
const il2cpp_log_path = __dirname + "/log/" + "il2cpp_log_path.txt"
const proto_classes_path = __dirname + "/log/" + "proto_classes_path.txt"
const il2cpp_images_path = __dirname + "/log/" + "il2cpp_images_path.txt"
const il2cpp_class_instance_path = __dirname + "/log/" + "il2cpp_class_instance_path.txt"
const il2cpp_classes_path = __dirname + "/log/" + "il2cpp_classes_path.txt"
const il2cpp_class_methods_path = __dirname + "/log/" + "il2cpp_class_methods_path.txt"
const il2cpp_class_fields_path = __dirname + "/log/" + "il2cpp_class_fields_path.txt"
const unity_dump_lua_path = __dirname + "/log/" + "unity_dump_lua_path.txt"
const unity_dump_lua_exist_path = __dirname + "/log/" + "unity_dump_lua_exist_path.txt"
const il2cpp_hook_function_result_path = __dirname + "/log/" + "il2cpp_hook_function_result_path.txt"
const il2cpp_trace_function_path = __dirname + "/log/" + "il2cpp_trace_function_path.txt"
const il2cpp_show_class_path = __dirname + "/log/" + "il2cpp_show_class_path.txt"
const cocos_js_dump_log_path = __dirname + "/log/" + "cocos_js_dump_log_path.txt"

