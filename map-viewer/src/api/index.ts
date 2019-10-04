export const getMap = (): Promise<any>  => {
    return fetch("http://localhost:4000/")
    .then((res:Response) => {
        console.log(res);
        return res.json()
    });
}

const m: any = {
    "metadata": {
        "width": 6,
        "height": 6,
        "seed": 1
    },
    "mapGrid": [
        {
            "cells": [
                [
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    }
                ],
                [
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    }
                ],
                [
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    }
                ],
                [
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    }
                ],
                [
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    }
                ],
                [
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "sea"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    },
                    {
                        "type": "grass"
                    }
                ]
            ]
        }
    ]
};