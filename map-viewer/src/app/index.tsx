import React from 'react';
import styled from "styled-components";

//https://css-tricks.com/snippets/javascript/lighten-darken-color/
const lightenDarkenColor = (col:string, amt:number) => {
  
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  
}

const mapTypeToColor = (t: string, depth?: number): string => {
   
        if(t === "grass") {
            const green = "#6ad15e";
            if(depth) {
                const shift = depth * 100.0;
                return lightenDarkenColor(green, shift);
            } else {
                return green;
            }
        }
        if( t === "sea") {
            const blue = "#a3a7d9";
            if(depth) {
                const shift = depth * 100.0;
                return lightenDarkenColor(blue, shift);
            } else {
                return blue;
            }
        }
        if( t === "beach") {
            return "#f0ce69";
        }
        if( t === "mountain") {
            return "black";
        }
        return "white";
}
const Cell = styled.td<{color: string}>`
width: 5px;
height: 5px;
background-color: ${props => props.color}
`;

const Table = styled.table`
border-spacing: 0px;
`;
const App: React.FC<{mapGridShape: any}> = (props) => (
    <Table>
        {props.mapGridShape.mapGrid[0].cells.map((row: any) => {
            return (<tr>
            {row.map((cell:any) => <Cell color={mapTypeToColor(cell.type, cell.depth)}/>)}
            </tr>)
        })
        }
    </Table>);

export default App;
