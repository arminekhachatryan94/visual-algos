export class Arr {
    public arr: number[];
    public name: string;

    constructor() {
        this.arr = [];
        this.name = '';
    }

    setArray(arr: number[]) {
        this.arr = arr;
    }

    setName(name: string) {
        this.name = name;
    }
}