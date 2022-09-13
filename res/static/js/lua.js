let lua_pull_need_show_index = 0

function input_lua(lua_path) {
    const parseData = {'name': lua_path}
    parseData.time = get_time()
    $('#lua_exist_table').bootstrapTable(
        'insertRow', {
            index: lua_pull_need_show_index, row: parseData
        }
    );
    lua_pull_need_show_index++

}

const lua_columns = [
    {
        field: 'name',
        title: 'lua文件名',
        escape: true
    },
    {
        field: 'time',
        title: '时间',
        escape: true
    }];
$('#lua_exist_table').bootstrapTable({
    columns: lua_columns,
    search: true,
    strictSearch: false,
});

function lua_pull() {
    $.ajax({
        url: '/dump_lua',
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            alert("Push成功")
        },
        error: function (res) {
            alert("Push失败")
        }
    });
}

function lua_decrypt() {
    $.ajax({
        url: '/dump_lua_decrypt',
        type: 'GET',
        dataType: 'json',
        success: function (res) {
            alert("解密成功")
        },
        error: function (res) {
            alert("解密失败")
        }
    });
}

function lua_push() {
    if (!($('#lua_push_file').val())) {
        alert("请重新输入")
        return
    }
    const put_file_path = $('#lua_push_file').val();
    let new_put_file_path
    if (put_file_path.indexOf("\\tools\\unlua") !== -1) {
        new_put_file_path = put_file_path.substring(put_file_path.indexOf("\\tools\\unlua") + 13).replaceAll("\\", "/")
    } else if (put_file_path.indexOf("\\tools\\luadump") !== -1) {
        new_put_file_path = put_file_path.substring(put_file_path.indexOf("\\tools\\luadump") + 15).replaceAll("\\", "/")
    }
    input_lua(put_file_path)
    $.ajax({
        url: '/revise_lua',
        type: 'POST',
        data: {
            "lua_path": put_file_path,
            "file_name": new_put_file_path,
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
