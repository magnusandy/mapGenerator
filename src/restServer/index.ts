import express, { Response } from "express";
import { MapGenerator, MapGeneratorConfig, Map } from "../mapService";
import { Optional, Function, Supplier } from "java8script";
import cors from "cors";

const expressApp = express();
expressApp.use(cors())

interface GenerateRequestDto {
    height?: number;
    width?: number;
    seed?: number;
}

expressApp.get("/", (req, res: Response) => {
    const inbound: GenerateRequestDto = req.query;
    console.log(inbound);
    const map: Map = timed(() => new MapGenerator(parseInbound(inbound)).generate());
    res.send(map);
});

function parseInbound(inbound: GenerateRequestDto): MapGeneratorConfig {
    return MapGeneratorConfig.builder()
    .setHeight(Optional.ofNullable(inbound.height))
    .setWidth(Optional.ofNullable(inbound.width))
    .setSeed(Optional.ofNullable(inbound.seed))
    .build();
}

function timed<R>(action: Supplier<R>): R {
    const before = new Date();
    const result:R = action();
    const after = new Date();
    console.log(`duration: ${after.valueOf() - before.valueOf()}`)
    return result;
}

expressApp.listen(4000, () => console.log(`Map Generator app listening on port 4000!`));