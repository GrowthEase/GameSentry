const image_columns = [
    {
        field: 'name',
        title: 'image名',
        escape: true
    }];
const class_columns = [
    {
        field: 'name',
        title: 'class名',
        escape: true
    }, {
        field: 'nameSpace',
        title: '命名空间',
        escape: true
    }];
const function_columns = [
    {
        field: 'name',
        title: '函数名',
        escape: true
    }];
const function_value_columns = [
    {
        field: 'name',
        title: '名称'
    }, {
        field: 'value',
        title: '设置值',
        formatter: function (value, row, index) {
            if (index == 0) {
                return ''
            }
            return `<div class="input-group mb-3">
  <input id="proto_function_value_text${index}" type="text" class="form-control" placeholder=${value}>
  <div class="input-group-append">
    <button class="btn btn-xs btn-success" title="修改" onclick=auditFunctionValue(${index})>修改</button>
  </div>
</div>`
        }
    }];
let audit_function_value = new Map()
let select_function_value
let select_image_value
let select_class_value

let select_trace_class = new Map()

function showFunction() {
    if (!select_class_value) {
        alert("请选择对应的class")
        return
    }
    $.ajax({
        url: '/show_class',
        type: 'POST',
        data: {
            "class_handle": select_class_value.addr,
        },
        dataType: 'json',
        success: function (res) {
            $("#class_show_info").html(res);
            $('#classModal').modal('show');
        },
        error: function (res) {
            alert("配置失败")
        }
    });
}

function traceFunction() {
    if (!select_class_value) {
        alert("请选择对应的class")
        return
    }
    select_trace_class.set(select_class_value.name, select_class_value.addr)
    $.ajax({
        url: '/trace_class',
        type: 'POST',
        data: {
            "class_handle": select_class_value.addr,
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

function hookFunction() {
    if (!select_function_value || !select_image_value || !select_class_value) {
        alert("请选择对应的函数")
        return
    }
    $.ajax({
        url: '/hook_method_info',
        type: 'POST',
        data: {
            "method_handle": select_function_value.addr,
            "class_handle": select_class_value.addr,
            "method_type": select_function_value.className,
            "class_name": select_class_value.name,
            "nameSpace": select_class_value.nameSpace,
            "img_name": select_image_value.name,
            "method_name": select_function_value.name,
            "parameters": select_function_value.parameters,
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

function sendFunctionValue(is_resend) {
    let put_function_value = []
    let function_return_value
    for (let [key, value] of audit_function_value) {
        if (key == -1) {
            continue
        }
        if (key == select_function_value.parameters.length) {
            function_return_value = value
            continue
        }
        put_function_value.push({
            "name": key,
            "value": value,
        })
    }

    if (!is_resend) {
        if (put_function_value.length < 1 && function_return_value == null) {
            alert("请输入要修改的值")
            return
        }
    }

    function chargeArgsParam() {
        let args = []
        for (let index in put_function_value) {
            const param = put_function_value[index]
            args.push({
                'index': param.name,
                'value': param.value
            })
        }
        return args
    }

    if (is_resend) {
        $.ajax({
            url: '/resend_function',
            type: 'POST',
            data: {
                "addr": select_function_value.addr,
                "args_param": chargeArgsParam(),
            },
            dataType: 'json',
            success: function (res) {
                alert("配置成功")
            },
            error: function (res) {
                alert("配置失败")
            }
        });
    } else {
        $.ajax({
            url: '/send_function',
            type: 'POST',
            data: {
                "addr": select_function_value.addr,
                "function_return_value": function_return_value,
                "args_param": chargeArgsParam(),
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
}

function auditFunctionValue(param) {
    if (!($(`#proto_function_value_text${param}`).val())) {
        alert("请重新输入")
        return
    }
    const value = $(`#proto_function_value_text${param}`).val()
    audit_function_value.set(param - 1, value)
}

$('#function_class_table').bootstrapTable({
    columns: class_columns,
    search: true,
    strictSearch: false,
});
$('#function_method_table').bootstrapTable({
    search: true,
    strictSearch: false,
    columns: function_columns,
});
$('#function_method_value_table').bootstrapTable({
    columns: function_value_columns,
});


function function_value_show(data) {
    let showValue = []
    showValue.push({
        "name": data.modifier + " " + data.className + " " + data.name
    })
    for (let index in data.parameters) {
        const param = data.parameters[index]
        showValue.push({
            "name": param.type + " " + param.name
        })
    }
    showValue.push({
        "name": "函数返回值" + " " + data.className
    })
    return showValue
}


$('#function_image_table').bootstrapTable({
    columns: image_columns,
    url: "images",
    method: 'GET',
    search: true,
    strictSearch: false,
    onClickRow: function (row, $element, field) {
        select_image_value = row;
        $('#function_class_table').bootstrapTable('destroy');
        $('#function_class_table').bootstrapTable({
            url: "classes",
            method: 'POST',
            search: true,
            strictSearch: false,
            columns: class_columns,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            queryParams: function (params) {
                params.addr = row.addr;
                return params;
            },
            onClickRow: function (row2, $element, field) {
                select_class_value = row2;
                $('#function_method_table').bootstrapTable('destroy');
                $('#function_method_table').bootstrapTable({
                    url: "methods",
                    method: 'POST',
                    search: true,
                    strictSearch: false,
                    columns: function_columns,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    queryParams: function (params) {
                        params.addr = row2.addr;
                        return params;
                    },
                    onClickRow: function (row3, $element, field) {
                        select_function_value = row3
                        audit_function_value.clear()
                        $('#function_method_value_table').bootstrapTable('destroy');
                        $('#function_method_value_table').bootstrapTable({
                            data: function_value_show(row3),
                            columns: function_value_columns,
                        });
                    }
                });

            }
        });

    }
});
