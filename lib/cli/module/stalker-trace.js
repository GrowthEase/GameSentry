const constants = require("../utils/constants");

const arm64CM = new CModule(`
#include <gum/gumstalker.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
extern void on_message(const gchar *message);
static void log(const gchar *format, ...);
static void on_arm64_before(GumCpuContext *cpu_context, gpointer user_data);
static void on_arm64_after(GumCpuContext *cpu_context, gpointer user_data);

gpointer shared_mem[] = {0, 0};
gpointer
get_shared_mem()
{
    return shared_mem;
}
static void
log(const gchar *format, ...)
{
    gchar *message;
    va_list args;
    va_start(args, format);
    message = g_strdup_vprintf(format, args);
    va_end(args);
    on_message(message);
    g_free(message);
}
void transform(GumStalkerIterator *iterator,
               GumStalkerOutput *output,
               gpointer user_data)
{
    cs_insn *insn;
    gpointer base = *(gpointer*)user_data;
    gpointer end = *(gpointer*)(user_data + sizeof(gpointer));

    while (gum_stalker_iterator_next(iterator, &insn))
    {
        gboolean in_target = (gpointer)insn->address >= base && (gpointer)insn->address < end;
        if(in_target)
        {
            log("%p\t%s\t%s", (gpointer)insn->address, insn->mnemonic, insn->op_str);
            gum_stalker_iterator_put_callout(iterator, on_arm64_before, (gpointer) insn->address, NULL);
        }
        gum_stalker_iterator_keep(iterator);
        if(in_target)
        {
            gum_stalker_iterator_put_callout(iterator, on_arm64_after, (gpointer) insn->address, NULL);
        }
    }
}
static void
on_arm64_before(GumCpuContext *cpu_context,
        gpointer user_data)
{
}
static void
on_arm64_after(GumCpuContext *cpu_context,
        gpointer user_data)
{
}`, {
    on_message: new NativeCallback(messagePtr => {
        const message = messagePtr.readUtf8String();
        console.log(message)
    }, 'void', ['pointer']),
});

function trace_stalker(method_addr, module) {
    Interceptor.attach(ptr(method_addr), {
        onEnter: function (args) {
            this.tid = Process.getCurrentThreadId()
            const userData = Memory.alloc(Process.pageSize);
            userData.writePointer(module.base)
            userData.add(constants.p_size).writePointer(module.base.add(module.size))
            Stalker.follow(this.tid, {
                transform: arm64CM.transform,
                data: userData
            })
        },
        onLeave: function (ret) {
            Stalker.unfollow(this.tid)
            Stalker.garbageCollect()
        }
    })
}

function trace_entry(method_addr, module) {
    Interceptor.attach(ptr(method_addr), {
        onEnter: function (args) {
            this.tid = Process.getCurrentThreadId();
            Stalker.follow(this.tid, {
                events: {
                    call: true,
                    ret: false,
                    exec: false,
                    block: false,
                    compile: false
                },
                onReceive: function (events) {
                    const all_events = Stalker.parse(events);
                    for (let i = 0; i < all_events.length; i++) {
                        const type = all_events[i][0];
                        if (type == "call") {
                            const addr1 = all_events[i][1];
                            try {
                                const module1 = Process.findModuleByAddress(ptr(addr1));
                                if (module1 != null && module1.name == module.name) {
                                    const addr2 = all_events[i][2];
                                    const module2 = Process.findModuleByAddress(ptr(addr2));
                                    console.log("call:" + module1.name + "!" + addr1.sub(module1.base) + "————" + module2.name + "!" + addr2.sub(module2.base));
                                }
                            } catch (error) {
                                console.log("exception error:", error);
                            }
                        }
                    }
                },
                onCallSummary: function (summary) {

                }
            });
        }, onLeave: function (retval) {
            Stalker.unfollow(this.tid);
            Stalker.garbageCollect()
        }
    });
}

module.exports = {
    trace_stalker,
    trace_entry
}
