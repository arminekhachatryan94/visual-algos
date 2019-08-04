export class Edge {
    data: {
        id: string,
        source: string,
        target: string
        weight: number
    }

    constructor(id: string, source: string, target: string, weight: number) {
        this.data = {
            id: id,
            source: source,
            target: target,
            weight: weight
        }
    }

    // setId(id: string) {
    //     this.data.id = id;
    // }

    // setSource(source: string) {
    //     this.data.source = source;
    // }

    // setTarget(target: string) {
    //     this.data.target = target;
    // }

    // setWeight(weight: string) {
    //     this.data.weight = weight;
    // }
}