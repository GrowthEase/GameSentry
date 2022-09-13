const socket = io.connect()
let proto_data_index = 1
let push_pid_param_map = new Map()
let push_pid_param_num
let select_value
let audit_value = new Map()

socket.on('il2cpp_proto_classes_result', function (msg) {
    if (msg.data.length) {
        const parseData = JSON.parse(msg.data)
        parseData.id = proto_data_index
        parseData.time = get_time()
        const push_pid_data = parseData["proto_class"] + parseData["img_name"] + parseData["nameSpace"]
        if (push_pid_param_map.has(push_pid_data)) {
            push_pid_param_num = push_pid_param_map.get(push_pid_data)
        } else {
            push_pid_param_map.set(push_pid_data, proto_data_index)
            push_pid_param_num = 0
        }
        parseData.pid = push_pid_param_num
        $('#protocol_index_table').bootstrapTable(
            'insertRow', {
                index: proto_data_index, row: parseData
            }
        );
        proto_data_index++
    }
});

const index_columns = [
    {
        field: "id",
        title: '序号',
        width: 100
    }, {
        field: 'proto_class',
        title: '协议类'
    }, {
        field: 'nameSpace',
        title: 'namespace'
    }, {
        field: 'img_name',
        title: 'image'
    }, {
        field: 'time',
        title: '时间'
    }];
const value_columns = [
    {
        field: "name",
        title: '参数名称'
    }, {
        field: 'type_value',
        title: '类型'
    }, {
        field: 'value',
        title: '参数值',
        formatter: function (value, row, index) {
            return `
<p>${value}</p>
<div class="input-group mb-3">
  <input id="proto_value_text${index}" type="text" class="form-control">
  <div class="input-group-append">
    <button class="btn btn-xs btn-success" title="修改" onclick=auditValue(${index})>修改</button>
  </div>
</div>`;
        },
    }];

function copyValue(value) {
    alert(value)
}

function auditValue(param) {
    if (!($(`#proto_value_text${param}`).val())) {
        alert("请重新输入")
        return
    }
    const value = $(`#proto_value_text${param}`).val()
    audit_value.set(param, value)
}

function chargeField(fieldType, fieldValue) {
    switch (fieldType) {
        case "bool":
            return fieldValue == "true";
        case "int8":
        case "uint8":
        case "int16":
        case "uint16":
        case "int32":
        case "uint32":
        case "int64":
        case "uint64":
            return parseInt(fieldValue);
        case "uchar":
            return fieldValue.charAt(0);
        case "float":
        case "double":
            return parseFloat(fieldValue);
        default :
            return fieldValue;
    }
}

function closeHookProtocol() {
    if (select_value == null) {
        alert("请选择具体的协议")
        return
    }
    $.ajax({
        url: '/function_detach',
        type: 'POST',
        data: {
            "addr": select_value.addr
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

function sendValueProtocol() {
    let put_field_value = []
    for (let [key, value] of audit_value) {
        const field = select_value.field[key]
        put_field_value.push({
            "name": field.name,
            "value": chargeField(field.type_value, value),
            "type_value": field.type_value,
            'handle': field.handle,
        })
    }
    if (put_field_value.length < 1) {
        alert("请输入要修改的值")
        return
    }
    $.ajax({
        url: '/injection_field',
        type: 'POST',
        data: {
            "img_name": select_value.img_name,
            "nameSpace": select_value.nameSpace,
            "proto_class": select_value.proto_class,
            "class_handle": select_value.class_addr,
            "fields": put_field_value,
            "hook_function_name": select_value.hook_function_name
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

$('#protocol_value_table').bootstrapTable({
    columns: value_columns,
});

$('#protocol_index_table').bootstrapTable({
    columns: index_columns,
    search: true,
    strictSearch: false,
    idField: 'id',
    treeShowField: 'id',
    parentIdField: 'pid',
    onResetView: function (data) {
        $('#protocol_index_table').treegrid({
            initialState: 'collapsed',
            treeColumn: 0,
            onChange: function () {
                $('#protocol_index_table').bootstrapTable('resetWidth');
            }
        });
    },
    onClickRow: function (row, $element, field) {
        audit_value.clear()
        select_value = row
        $('#protocol_value_table').bootstrapTable('destroy');
        $('#protocol_value_table').bootstrapTable({
            data: row.field,
            columns: value_columns,
        });

    }
});
