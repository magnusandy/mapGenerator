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
    Empty = "empty",
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

interface OceanParams {
    /**
     * the number of full rings around the outside edge of the map
     */
    thickness: number;
    /**
     * the number of elements in the array represents how many extra rings will be added inside the 
     * full outer rings, the value (float percentage i.e. 0.10 is 10% is how likely it is that the water will
     * be expanded at each point, given it has at least on adjacent water neighbour)
     */
    extendedLayeringPercentages: number[];
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

    /**
     * Generates the ocean map layer, conceptually, this layer will border any map
     * with a base thickness, provided by the thickness param and a chance to increase thickness at any point
     * defined by the chanceToThicken;
     * @param thickness: integer to define the base thickeness around the border of the map 
     * @param chanceToThicken number between 0-1, 10% would be 0.1: for every concentric point inside the border this chance will define 
     * how likely it is that that will also be a ocean tile, this should give a "natural" craggy border,
     */
    private generateOceanLayer(params: OceanParams): Grid<MapCell> {
        const { width, height } = this.config;
        const { thickness } = params;
        const oceanTile: MapCell = { type: CellType.Sea };
        const oceanGrid: Grid<MapCell> = Grid.emptyGrid(width, height);
        console.log("ocean1");
        //step 1 create the thickeness based rings
        Stream.range(0, thickness)
            .forEach(ringNumber => this.addRing(oceanGrid, ringNumber, 1, oceanTile, false));

        console.log("ocean2");
        //step 2 generate random inner rings
        params.extendedLayeringPercentages.forEach((percent, index) => {
            const ringNumber = thickness + index;
            this.addRing(oceanGrid, ringNumber, percent, oceanTile, true);
        });
        return oceanGrid;
    }

    private addRing(grid: Grid<MapCell>, ringNumber: number, chanceToThicken: number, cellToPlace: MapCell, requireAdjacent: boolean): Grid<MapCell> {
        for (const coord of grid.getRingCoordinates(ringNumber)) {
            const shouldAddTile = this.numberGenerator.random() <= chanceToThicken;
            if (shouldAddTile) {
                if (requireAdjacent) {
                    const hasAdjacent = Stream.of(grid.getAdjacentNeighbours(coord))
                        .flatMapOptional(i => i)
                        .anyMatch(cell => cell.type === cellToPlace.type);
                    if (hasAdjacent) {
                        grid.setCoord(coord, cellToPlace);
                    }
                } else {
                    grid.setCoord(coord, cellToPlace);
                }
            }
        }
        return grid;
    }

    private generateGrid(): Layer[] {
        const { width, height } = this.config;

        console.log("step1");
        // step 1, create a flat ground layer
        const groundLayer: Grid<MapCell> = Grid.filledGrid(width, height, { type: CellType.Grass });
        console.log("step2");
        //step 2, generate a ocean layer
        const oceanLayer: Grid<MapCell> = this.generateOceanLayer({thickness: 3, extendedLayeringPercentages: [0.9, 0.5, 0.1]});
        //step 3 flatten base layers into a single layer
        console.log("step3");
        const baseLayer = groundLayer.flattenOnto(oceanLayer);

        console.log("step4");
        //step 4, fill layers with empties and return
        return [
            {
                cells: baseLayer.fillEmptyWith({ type: CellType.Empty }).getGrid()
            },
        ];
    }
}

interface Coordinate {
    y: number;
    x: number;
}

/**
 * conceptually, the height is the first part of the multipart array, and each array inside is a row
 * the origin of the grid is the top left corner at (y=0,x=0). the coordinate (y=1, x=0) would be in the first
 * column, down one square from the origin.  
 * 
 * the width and height are the REAL value, not the 0 based value of height and width
 */
export class Grid<T> {
    /*
    let h:number,w: number;
            for (h = 0; h < this.height; h++) {
                const row = this.grid[h];
                for (w = 0; w < this.width; w++) {
                    const item = row[w];
                    const coord:Coordinate = {y: h, x: w};
                    //todo something with item
                }
            }
    */

    private width: number;
    private height: number;
    private grid: Optional<T>[][];
    private memoizedCoordinateArray: Optional<Coordinate[]>;

    constructor();
    constructor(width: number, height: number);
    constructor(width?: number, height?: number) {
        this.width = width ? width : 0;
        this.height = height ? height : 0;
        this.grid = this.emptyGrid();
        this.memoizedCoordinateArray = Optional.empty();
    }

    public static emptyGrid<T>(width: number, height: number): Grid<T> {
        return new Grid<T>(width, height);
    }

    //Returns a grid where all items are the given value
    public static filledGrid<T>(width: number, height: number, item: T): Grid<T> {
        const grid = new Grid<T>(width, height);
        return grid.fill(item);
    }

    private emptyGrid(): Optional<T>[][] {
        let h: number, w: number;
        const newGrid: Optional<T>[][] = [];
        for (h = 0; h < this.height; h++) {
            const newRow: Optional<T>[] = [];
            for (w = 0; w < this.width; w++) {
                newRow.push(Optional.empty());
            }
            newGrid.push(newRow);
        }
        return newGrid;
    }

    public getRow(row: number): Optional<T>[] {
        return this.grid[row];
    }

    public getColumn(col: number): Optional<T>[] {
        return this.grid.map(row => row[col]);
    }

    /**
     * returns the coordinates of all the cells that encompass the numbered ring
     * a ring is a complete path around the grid in a square a single item in thickness
     * and ring distance away from the edge, so ring 0 would be all the cells on the outer border
     * of a grid, ring 1 would be the border of the map 1 cell in from the outside.
     * 
     * This function can throw an exception if the ring param is greater than width/2 or height/2
     * @param ring 
     * @throws InvalidParamException
     */
    public getRingCoordinates(ring: number): Coordinate[] {
        if (!this.isRingValid(ring)) {
            throw Error("InvalidParamException");
        }

        const ringCoords = [];
        for (const coord of this.coordinateArray()) {
            if ((coord.x === ring) || (coord.y == ring) || coord.x === (this.width - 1 - ring) || coord.y === (this.height - 1 - ring)) {
                ringCoords.push(coord);
            }
        }
        return ringCoords;
    }

    private coordinateArray(): Coordinate[] {
        if (this.memoizedCoordinateArray.isPresent()) {
            return this.memoizedCoordinateArray.get();
        } else {
            let h: number, w: number;
            const allCoords: Coordinate[] = [];
            for (h = 0; h < this.height; h++) {
                for (w = 0; w < this.width; w++) {
                    const coord: Coordinate = { y: h, x: w };
                    allCoords.push(coord);
                }
            }
            this.memoizedCoordinateArray = Optional.of(allCoords);
            return allCoords;
        }
    }

    //A ring is considered valid if it is less than half of the width or height, whichever is smaller
    // for example a 2x2 grid can only have 1 ring, a 2xN ring can only ever have 1 ring
    // a 3x3 ring can have 2 rings
    private isRingValid(ring: number): boolean {
        const smallestDim = Math.min(this.width, this.height);
        const isEven = smallestDim % 2 === 0;

        if (isEven) {
            return ring <= (smallestDim / 2);
        } else { //isOdd
            return ring <= ((smallestDim / 2) + 1);
        }

    }

    public get(y: number, x: number): Optional<T> {
        return this.getCoord({ y, x });
    }

    public getCoord(coord: Coordinate): Optional<T> {
        const { y, x } = coord;
        return this.grid[y][x];
    }

    //get the 4 (or less) directly adjacent neighbours of the given coordinate
    public getAdjacentNeighbours(coord: Coordinate): Optional<T>[] {
        const { y, x } = coord;
        return Stream.ofValues(
            this.safeGet(y + 1, x),
            this.safeGet(y - 1, x),
            this.safeGet(y, x + 1),
            this.safeGet(y, x - 1),
        ).flatMapOptional(o => o)
            .toArray();
    }


    /**
     * flattens the given top grid into the working grid, replacing any elements from the "bottom" with the top, if exists.
     * @param topGrid any existing elements will be added to the base grid
     * @throws IllegalArgumentException if the grid sizes do not match
     */
    public flattenOnto(topGrid: Grid<T>): Grid<T> {

        if (topGrid.width !== this.width || topGrid.height !== this.height) {
            throw Error("IllegalArgumentException");
        }

        for (const coord of topGrid.coordinateArray()) {
            const topItem: Optional<T> = topGrid.getCoord(coord);
            if (topItem.isPresent()) {
                this.setCoord(coord, topItem.get());
            }
        }

        return this;
    }

    public fillEmptyWith(item: T): Grid<T> {
        for (const coord of this.coordinateArray()) {
            const itemAtCoord: Optional<T> = this.getCoord(coord);
            if (!itemAtCoord.isPresent()) {
                this.setCoord(coord, item);
            }
        }

        return this;
    }

    //safely handles out of bounds exceptions
    private safeGet(y: number, x: number): Optional<Optional<T>> {
        try {
            return Optional.of(this.get(y, x));
        } catch (error) {
            return Optional.empty();
        }
    }

    public set(y: number, x: number, item: T): Grid<T> {
        return this.setCoord({ y, x }, item);
    }

    public setCoord(coord: Coordinate, item: T): Grid<T> {
        const { y, x } = coord;
        this.grid[y][x] = Optional.of(item);
        return this;
    }

    public clear(y: number, x: number): Grid<T> {
        this.grid[y][x] = Optional.empty();
        return this;
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

    //replace all items with the given item
    private fill(item: T): Grid<T> {
        let h: number, w: number;
        for (h = 0; h < this.height; h++) {
            const row = this.grid[h];
            for (w = 0; w < this.width; w++) {
                const coord: Coordinate = { y: h, x: w };
                this.setCoord(coord, item);
            }
        }
        return this;
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
