export class Element {
    value: number;
    backgroundColor: string;
    border: string;

    constructor(
        value: number,
        color: string
    ) {
        this.value = value;
        this.backgroundColor = '';
        this.border = '';
        if(color === 'blue') {
            this.backgroundColor = '#55DDFE';
            this.border = '#01A4CD';
        }
    }
}