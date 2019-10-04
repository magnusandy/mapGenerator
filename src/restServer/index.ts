import express, { Response } from "express";
import { MapGenerator, MapGeneratorConfig, Map } from "../mapService";
import { Optional } from "java8script";

const expressApp = express();

expressApp.get("/", (req, res: Response) => {
    const map: Map = new MapGenerator(MapGeneratorConfig.builder().setHeight(Optional.of(6)).setWidth(Optional.of(6)).setSeed(Optional.of(1)).build()).generate();
    res.send(map);
});

expressApp.listen(3000, () => console.log(`Map Generator app listening on port 3000!`));