let hook_method_index = 0
let select_hook_method_value
socket.on('il2cpp_hook_function_result', function (msg) {
    if (msg.data.length) {
        const parseData = JSON.parse(msg.data)
        parseData.time = get_time()
        $('#hook_method_table').bootstrapTable(
            'insertRow', {
                index: hook_method_index, row: parseData
            }
        );
        hook_method_index++
    }
});
const hook_method_columns = [
    {
        field: 'method',
        title: 'method',
        escape: true
    },
    {
        field: 'class_name',
        title: 'class',
        escape: true
    },
    {
        field: 'nameSpace',
        title: 'nameSpace',
        escape: true
    },
    {
        field: 'img_name',
        title: 'image',
        escape: true
    },
    {
        field: 'time',
        title: '时间',
        escape: true
    }];

function closeFunctionHook() {
    if (select_hook_method_value == null) {
        alert("请选择具体的函数")
        return
    }
    $.ajax({
        url: '/function_detach',
        type: 'POST',
        data: {
            "addr": select_hook_method_value.addr,
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

function hook_method_value_show(data) {
    let showValue = []
    for (let index in data.param) {
        const param_data = data.param[index]
        showValue.push({
            "name": "参数 " + param_data.type + " " + param_data.name,
            "value": param_data.value
        })
    }
    for (let index in data.field) {
        const param_data = data.field[index]
        showValue.push({
            "name": "内存 " + param_data.type + " " + param_data.name,
            "value": param_data.value
        })
    }
    showValue.push({
        "name": "函数返回值",
        "value": data.return
    })
    return showValue
}

const hook_method_value_columns = [
    {
        field: 'name',
        title: '名称'
    }, {
        field: 'value',
        title: '设置值',
        formatter: function (value, row, index) {
            return `<div class="input-group mb-3">
  <input id="hook_method_value_text${index}" type="text" class="form-control" placeholder=${value}>
  <div class="input-group-append">
    <button class="btn btn-xs btn-success" title="复制" onclick=copyValue(${value})>复制</button>
  </div>
</div>`
        }
    }];
$('#hook_method_value_table').bootstrapTable({
    columns: hook_method_value_columns,
});
$('#hook_method_table').bootstrapTable({
    columns: hook_method_columns,
    search: true,
    strictSearch: false,
    onClickRow: function (row, $element, field) {
        select_hook_method_value = row
        $('#hook_method_value_table').bootstrapTable('destroy');
        $('#hook_method_value_table').bootstrapTable({
            data: hook_method_value_show(row),
            columns: hook_method_value_columns,
        });
    }
});

