import React from 'react';
import styled from "styled-components";

const mapTypeToColor = (t: any): string => {
   
        if(t === "grass") {
            return "green";
        }
        if( t === "sea") {
            return "blue";
        }
        if( t === "beach") {
            return "#f0ce69";
        }
        return "white";
}
const Cell = styled.td<{color: string}>`
width: 5px;
height: 5px;
background-color: ${props => props.color}
`;
const App: React.FC<{mapGridShape: any}> = (props) => (
    <table>
        {props.mapGridShape.mapGrid[0].cells.map((row: any) => {
            return (<tr>
            {row.map((cell:any) => <Cell color={mapTypeToColor(cell.type)}/>)}
            </tr>)
        })
        }
    </table>);

export default App;
