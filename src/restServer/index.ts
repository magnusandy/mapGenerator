import express, { Response } from "express";
import { MapGenerator, MapGeneratorConfig, Map } from "../mapService";

const expressApp = express();

expressApp.get("/", (req, res: Response) => {
    const map: Map = new MapGenerator(MapGeneratorConfig.builder().build()).generate();
    res.send(map);
});

expressApp.listen(3000, () => console.log(`Map Generator app listening on port 3000!`));