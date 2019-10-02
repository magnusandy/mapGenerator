import { Optional, Stream } from "java8script";
import MersenneTwister from "mersenne-twister";

export interface MetaData {
    width: number;
    height: number;
    seed: number;
};

export enum CellType {
    Sea = "sea",
    Grass = "grass",
    Beach = "beach",
}

export interface MapCell {
    type: CellType;
}

export interface Layer {
    cells: MapCell[][];
}

export interface Map {
    metadata: MetaData;
    mapGrid: Layer[];
}

export class MapGenerator {
    private config: MapGeneratorConfig;
    private numberGenerator: MersenneTwister;
    public constructor(config: MapGeneratorConfig) {
        this.config = config;
        this.numberGenerator = new MersenneTwister(config.seed);
    }

    public generate(): Map {
        return {
            metadata: {
                ...this.config
            },
            mapGrid: this.generateGrid(),
        };
    }

    private generateGrid(): Layer[] {
        return [
            {
                cells: new Grid<MapCell>().getGrid()
            },
        ];
    }
}

/**
 * conceptually, the height is the first part of the multipart array, and each array inside is a row
 */
export class Grid<T> {
    private width: number;
    private height: number;
    private grid: Optional<T>[][];

    constructor();
    constructor(width?: number, height?: number) {
        this.width = width ? width : 0;
        this.height = height ? height : 0;
        this.grid = this.emptyGrid();
    }

    private emptyGrid(): Optional<T>[][] {
        return Stream.range(0, this.height)
            .map(() => Stream.range(0, this.width).map(() => Optional.empty<T>()).toArray())
            .toArray();
    }

    public getOptionalGrid(): Optional<T>[][] {
        return this.grid;
    }

    public getGrid(): T[][] {
        return this.grid
            .map((row: Optional<T>[]) =>
                row.map(((cell: Optional<T>) => cell.orElseThrow(() => new Error("trying to fetch a filled grid with empty cells!"))))
            );
    }
}

export class MapGeneratorConfig {
    public readonly width: number;
    public readonly height: number;
    public readonly seed: number;

    private constructor(
        width: number,
        height: number,
        seed: number
    ) {
        this.width = width;
        this.height = height;
        this.seed = seed;
    }

    public static Builder = class Builder {
        private width: Optional<number> = Optional.empty();
        private height: Optional<number> = Optional.empty();
        private seed: Optional<number> = Optional.empty();

        public setWidth(width: Optional<number>): Builder {
            this.width = width;
            return this;
        }

        public setHeight(height: Optional<number>): Builder {
            this.height = height;
            return this;
        }

        public setSeed(seed: Optional<number>): Builder {
            this.seed = seed;
            return this;
        }

        public build(): MapGeneratorConfig {
            return new MapGeneratorConfig(
                this.width.orElse(100),
                this.height.orElse(100),
                this.seed.orElseGet(() => new MersenneTwister().random_int())
            );
        }
    }

    public static builder() {
        return new MapGeneratorConfig.Builder();
    }
}
