
function hotfix(filename)
    CS.UnityEngine.Debug.LogError("start hotfix: "..filename)
    local dumpname = string.gsub(filename,"%.","_")

    local oldModule
    if package.loaded[filename] then
        oldModule = package.loaded[filename]
    elseif package.loaded[dumpname] then
        oldModule = package.loaded[dumpname]
    else
        CS.UnityEngine.Debug.LogError('this file nevev loaded: '..filename)
        require(filename)
    end

    package.loaded[filename] = nil
    package.loaded[dumpname] = nil

    CS.UnityEngine.Debug.LogError('loaded newMpdule '..dumpname..' ,oldModule: '..filename)
    local newModule = package.loaded[dumpname]
    if newModule == nil then
        -- try again
        require(dumpname)
        newModule = package.loaded[dumpname]
    end

    CS.UnityEngine.Debug.LogError('oldModule: '.. tostring(oldModule)..' ,newModule: '..tostring(newModule))
    -- 注释掉就只能修改函数
    update_table(newModule, oldModule,updated_tables)

    if newModule == nil then
        package.loaded[filename] = oldModule
        CS.UnityEngine.Debug.LogError('replaced faild !! ')
        return
    end
    package.loaded[filename] = newModule

    CS.UnityEngine.Debug.LogError('replaced succeed')

end

function ResetENV(object, name)
    local visited = {}
    local function f(object, name)
        if not object or visited[object] then return end
        visited[object] = true
        if type(object) == "function" then
            xpcall(function () setfenv(object, _G) end, CS.UnityEngine.Debug.LogError)
        elseif type(object) == "table" then
            for k, v in pairs(object) do
                f(k, tostring(k).."__key" )
                f(v, tostring(k))
            end
        end
    end
    f(object, name)
end

function update_func(new_func, old_func)
    assert("function" == type(new_func))
    assert("function" == type(old_func))

    -- Get upvalues of old function.
    local old_upvalue_map = {}
    local OldExistName = {}
    for i = 1, math.huge do
        local name, value = debug.getupvalue(old_func, i)
        if not name then break end
        old_upvalue_map[name] = value
        OldExistName[name] = true
    end

    -- Update new upvalues with old.
    for i = 1, math.huge do
        local name, value = debug.getupvalue(new_func, i)
        if not name then break end
        --CS.UnityEngine.Debug.LogError('set up value: name:'..name..' typeof '.. type(value))
        if OldExistName[name] then
            local old_value = old_upvalue_map[name]
            if type(old_value) == "function" then
                setfenv(new_func, getfenv(old_func))
                debug.setupvalue(new_func, i, old_value)
            else
                debug.setupvalue(new_func, i, old_value)
            end
        else
             -- 对新添加的upvalue设置正确的环境表
            ResetENV(value,name)
        end
    end
end

function update_table(new_table, old_table, updated_tables)
    assert("table" == type(new_table))
    assert("table" == type(old_table))

    -- Compare 2 tables, and update old table.
    for key, value in pairs(new_table) do
        local old_value = old_table[key]
        local type_value = type(value)
        if type_value == "function" then
            update_func(value, old_value)
            old_table[key] = value

        elseif type_value == "table" then
            if ( updated_tables[value] == nil ) then
                updated_tables[value] = true
                update_table(value, old_value,updated_tables)
            end
        end
    end

    ---- Update metatable.
    local old_meta = debug.getmetatable(old_table)
    local new_meta = debug.getmetatable(new_table)
    if type(old_meta) == "table" and type(new_meta) == "table" then
        update_table(new_meta, old_meta,updated_tables)
    end
end
