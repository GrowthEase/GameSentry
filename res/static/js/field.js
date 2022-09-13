const field_columns = [
    {
        field: "name",
        title: '参数名称'
    },
    {
        field: 'fieldName',
        title: '类型'
    },
    {
        field: 'fieldModifier',
        title: '修饰符'
    }, {
        field: 'fieldValue',
        title: '参数值',
        formatter: function (value, row, index) {
            return `<div class="input-group mb-3">
  <input id="field_value_text${index}" type="text" class="form-control" placeholder=${value}>
  <div class="input-group-append">
    <button class="btn btn-xs btn-success" title="修改" onclick=auditFieldValue(${index})>修改</button>
  </div>
</div>`;
        },
    }
];

let select_field

function auditFieldValue(param) {
    if (!($(`#field_value_text${param}`).val())) {
        alert("请重新输入")
        return
    }
    const value = $(`#field_value_text${param}`).val()
    const target_field = select_field[param]
    $.ajax({
        url: '/hook_field',
        type: 'POST',
        data: {
            "instance_addr": target_field.valueAddress,
            "value": value,
            "addr": target_field.field,
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


$('#field_image_table').bootstrapTable({
    columns: image_columns,
    search: true,
    strictSearch: false,
    url: "images",
    method: 'GET',
    onClickRow: function (row, $element, field) {
        $('#field_class_table').bootstrapTable('destroy');
        $('#field_class_table').bootstrapTable({
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
                $('#field_instance_table').bootstrapTable('destroy');
                $('#field_instance_table').bootstrapTable({
                    url: "search_class_instance",
                    method: 'POST',
                    search: true,
                    strictSearch: false,
                    columns: field_instance_columns,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    queryParams: function (params) {
                        params.addr = row2.addr;
                        return params;
                    },
                    onClickRow: function (row3, $element, field) {
                        $('#field_table').bootstrapTable('destroy');
                        $('#field_table').bootstrapTable({
                            url: "fields_instance",
                            method: 'POST',
                            columns: field_columns,
                            search: true,
                            strictSearch: false,
                            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                            queryParams: function (params) {
                                params.addr = row3.addr;
                                params.class_instance = row3.class_instance;
                                return params;
                            },
                            onLoadSuccess: function (data) {
                                select_field = data
                            }
                        });

                    }
                });
            }
        });

    },
});


$('#field_class_table').bootstrapTable({
    search: true,
    strictSearch: false,
    columns: class_columns,
});

const field_instance_columns = [
    {
        field: 'class_instance',
        title: '实例',
        escape: true
    }];

$('#field_instance_table').bootstrapTable({
    search: true,
    strictSearch: false,
    columns: field_instance_columns,
});
$('#field_table').bootstrapTable({
    columns: field_columns,
    search: true,
    strictSearch: false,
});
