
export function getUniqueStrings(arr: Array<string>) {
    const _arr: string[] = [];
    arr.forEach(item => {
        if (!_arr.includes(item)) _arr.push(item)
    })
    return _arr;
}

export function getUnique<T>(arr: Array<T>, uniqueField: string) {
    const _arr: T[] = [];
    const map: {[key: string]: boolean} = {}
    arr.forEach((item: any) => {
        if (!map[item[uniqueField]]) {
            _arr.push(item)
            map[item[uniqueField]] = true;
        }
    })
    return _arr;
}

export function getUniqueById<T>(arr: Array<T>) {
    return getUnique(arr, 'id');
}

