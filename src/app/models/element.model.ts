const blueBackground = '#55DDFE';
const blueBorder = '#01A4CD';
const redBackground = '#FFC0CB';
const redBorder = '#F08080';
const yellowBackground = '#EBEF81';
const yellowBorder = '#A8AE05';

export class Element {
    value: number;
    background: string;
    border: string;
    visibility: boolean;

    constructor(
        value: number,
        color: string
    ) {
        this.value = value;
        this.background = '';
        this.border = '';
        if(color === 'blue') {
            this.background = blueBackground;
            this.border = blueBorder;
        } else if(color === 'red') {
            this.background = redBackground;
            this.border = redBorder;
        } else if(color === 'yellow') {
            this.background = yellowBackground;
            this.border = yellowBorder;
        }
        this.visibility = true;
    }

    changeColor(color: string) {
        if(color === 'blue') {
            this.background = blueBackground;
            this.border = blueBorder;
        } else if(color === 'red') {
            this.background = redBackground;
            this.border = redBorder;
        } else if(color === 'yellow') {
            this.background = yellowBackground;
            this.border = yellowBorder;
        }
    }

    changeVisibility(visibility: boolean) {
        this.visibility = visibility;
    }
}