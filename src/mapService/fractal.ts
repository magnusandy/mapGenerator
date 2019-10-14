import {Supplier, Stream} from "java8script";

//https://en.wikipedia.org/wiki/L-system

export enum Direction {
    N = "N",
    S = "S",
    E = "E",
    W = "W",
}

const MountainRules: {[t in Direction]: Supplier<Direction[]>} = {
    N: () => [Direction.E, Direction.E],
    E: () => [Direction.S, Direction.W],
    S: () => [Direction.W, Direction.W],
    W: () => [Direction.N, Direction.E],
}

export function generateFractal(seed: Direction[], generations: number): Direction[] {
    let base = [...seed];
    console.log(`generation 0: ${base}`);
    Stream.range(0, generations)
    .forEach(_generation => {
        base = calculateNext(base);
        console.log(`generation ${_generation+1}: ${base}`);
    });
    return base;
}

function calculateNext(seed: Direction[]): Direction[] {
    return Stream.of(seed)
    .map(v => MountainRules[v])
    .map(supplier => supplier())
    .flatMapList(l => l)
    .toArray();
        
}