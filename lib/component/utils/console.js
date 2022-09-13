"use strict";
Object.defineProperty(exports, "__esModule", {value: true});
exports.inform = exports.ok = exports.warn = exports.raise = exports.out = void 0;
const helper = require("../../cli/utils/helper");

/** @internal */
function raise(message) {
    throw `\x1B[0m\x1B[38;5;9mil2cpp\x1B[0m: ${message}`;
}

exports.raise = raise;

/** @internal */
function warn(message) {
    globalThis.console.log(`\x1B[38;5;11mil2cpp\x1B[0m: ${message}`);
}

exports.warn = warn;

/** @internal */
function ok(message) {
    globalThis.console.log(`\x1B[38;5;10mil2cpp\x1B[0m: ${message}`);
}

exports.ok = ok;

/** @internal */
function inform(message) {
    globalThis.console.log(`\x1B[38;5;12mil2cpp\x1B[0m: ${message}`);
}

exports.inform = inform;

function out(message) {
    globalThis.console.log(`\x1B[38;5;12mil2cpp\x1B[0m: ${message}`);
    helper.send_message("il2cpp_trace_function",
        message.replaceAll("\x1b[35m", "")
            .replaceAll("\x1b[0m", "")
            .replaceAll("\x1b[32m", "")
            .replaceAll("\x1b[31m", "")
            .replaceAll("\x1b[33m", "")
            .replaceAll("\x1b[36m", "")
            .replaceAll("\x1b[2m0x", "")
            .replaceAll("\x1b[1m", "")
            .replaceAll("\x1b[2m", "")
    );
}

exports.out = out;
