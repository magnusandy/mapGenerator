import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { getMap } from './api';

getMap()
.then(map => {
    ReactDOM.render(<App  mapGridShape={map}/>, document.getElementById('root'));
})