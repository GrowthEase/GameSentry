const editor = CodeMirror.fromTextArea(load_frida_script, {
    mode: 'javascript',
    theme: 'dracula',
});
editor.setSize("100%", 400);

const editor_log = CodeMirror.fromTextArea(log_frida_script, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
    readOnly: true
});
editor_log.setSize("100%", 300);

editor_log.setCursor(editor_log.lineCount(), 0);

socket.on('heap_search', function (msg) {
    if (msg.data.length) {
        editor_log.setValue(editor_log.getValue() + msg.data + "\n");
        editor_log.setCursor(editor_log.lineCount(), 0)
    }
});

function frida_custom_script() {
    $.ajax({
        url: '/load_frida_script',
        type: 'POST',
        data: {
            "frida_custom_script": editor.getValue(),
        },
        dataType: 'json',
        success: function (res) {
            alert("配置成功")
        },
        error: function (res) {
            alert("配置失败")
        }
    });
}
