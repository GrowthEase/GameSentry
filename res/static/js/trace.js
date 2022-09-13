const editor_trace = CodeMirror.fromTextArea(show_trace, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
    readOnly: true
});
editor_trace.setSize("100%", 700);

editor_trace.setCursor(editor_trace.lineCount(), 0);

socket.on('il2cpp_trace_function', function (msg) {
    if (msg.data.length) {
        editor_trace.setValue(editor_trace.getValue() + msg.data.substring(1, msg.data.length - 1) + "\n");
        editor_trace.setCursor(editor_trace.lineCount(), 0)
    }
});

function showTrace() {
    $("#trace_menu").empty();
    let opts = "";
    for (let [key, value] of select_trace_class) {
        opts += `<button type='button' class='btn' onclick=closeTrace('${key}')>${key}</button>`
    }
    $("#trace_menu").append(opts);
}

function closeTrace(key) {
    const handle = select_trace_class.get(key);
    select_trace_class.delete(key);
    $.ajax({
        url: '/close_trace',
        type: 'POST',
        data: {
            "class_handle": handle,
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
