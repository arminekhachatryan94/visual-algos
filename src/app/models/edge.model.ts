export class Edge {
    data: {
        id: string,
        source: string,
        target: string
    }

    constructor(id: string, source: string, target: string) {
        this.data = {
            id: id,
            source: source,
            target: target
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