export class Arr {
    public arr: number[];
    public name: string;
    public ordering: number;

    constructor() {
        this.arr = [];
        this.name = '';
        this.ordering = 0;
    }

    setArray(arr: number[]) {
        this.arr = arr;
    }

    setName(name: string) {
        this.name = name;
    }

    setOrdering(ordering: number) {
        this.ordering = ordering;
    }
}