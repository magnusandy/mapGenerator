import express, { Response } from "express";
import { MapGenerator, MapGeneratorConfig, Map } from "../mapService";
import { Optional } from "java8script";
import cors from "cors";

const expressApp = express();
expressApp.use(cors())

expressApp.get("/", (req, res: Response) => {
    const map: Map = new MapGenerator(MapGeneratorConfig.builder().setHeight(Optional.of(100)).setWidth(Optional.of(100)).build()).generate();
    res.send(map);
});

expressApp.listen(4000, () => console.log(`Map Generator app listening on port 4000!`));