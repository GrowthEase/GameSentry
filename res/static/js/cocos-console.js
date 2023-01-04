var socket = io();

const logconsole = CodeMirror.fromTextArea(log_console, {
    lineNumbers: true,
    mode: 'javascript',
    theme: 'dracula',
    readOnly: true
});
logconsole.setSize("100%", 300);

socket.on('cocos_js_dump', function(msg) {
    console.log(msg)
    if (msg.length) {
        logconsole.setValue(logconsole.getValue() + msg + "\n");
        logconsole.setCursor(logconsole.lineCount(), 0)
    }
});