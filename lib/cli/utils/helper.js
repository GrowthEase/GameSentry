function send_message(func, value, data) {
    let message = {};
    message["function"] = func;
    message["value"] = value;
    send(message, data)
}

module.exports = {
    send_message
}
