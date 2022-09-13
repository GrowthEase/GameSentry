const editor_log_show = CodeMirror.fromTextArea(show_log, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
    readOnly: true
});
editor_log_show.setSize("100%", 700);

editor_log_show.setCursor(editor_log_show.lineCount(), 0);

socket.on('il2cpp_log', function (msg) {
    if (msg.data.length) {
        editor_log_show.setValue(editor_log_show.getValue() + msg.data.substring(1, msg.data.length - 1) + "\n");
        editor_log_show.setCursor(editor_log_show.lineCount(), 0)
    }
});
