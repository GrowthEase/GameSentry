let base_assemblies;
let base_images;

function assemblies() {
    if (base_assemblies) {
        return base_assemblies;
    }
    base_assemblies = Il2Cpp.Domain.assemblies;
    return base_assemblies;
}

function images() {
    if (base_images) {
        return base_images;
    }
    const array = [];
    for (const assembly of assemblies()) {
        const image = assembly.image.toString();
        array.push(image);
    }
    base_images = array;
    return base_images;
}

function classes(handle) {
    const array = [];
    const image = new Il2Cpp.Image(new NativePointer(handle));
    for (const clazz of image.classes) {
        const image = clazz.toString();
        array.push(image);
    }
    return array;
}

function methods(handle) {
    const array = [];
    const clazz = new Il2Cpp.Class(new NativePointer(handle));
    for (const method of clazz.methods) {
        const target = method.toString();
        array.push(target);
    }
    return array;
}

function fields(handle) {
    const array = [];
    const clazz = new Il2Cpp.Class(new NativePointer(handle));
    for (const field of clazz.fields) {
        const target = field.toString();
        array.push(target);
    }
    return array;
}

function detach(handle) {
    Interceptor.revert(new NativePointer(handle));
}

function correction_input(type, value) {
    switch (type) {
        case 2 :
            return value.toLocaleUpperCase == "TRUE" ? 1 : 0;
        case 4 :
        case 5:
        case 6:
        case 7 :
        case 8:
        case 9:
        case 3:
        case 10:
        case 11:
        case 12:
        case 13:
            return parseFloat(value);
        case 14:
            return Il2Cpp.String.from(value);
        default:
            console.log('This type is not currently supported: ' + type);
            return null;

    }
}

module.exports = {
    assemblies,
    images,
    classes,
    methods,
    fields,
    detach,
    correction_input
}
