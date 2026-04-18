import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { useSocket } from '../socket/SocketContext';
import { useParams } from 'react-router-dom';

const DrawingCanvas = ({ color = '#000000', brushSize = 5, isDrawer = true }) => {
  const [lines, setLines] = useState([]);
  const isDrawing = useRef(false);
  const socket=useSocket();
  const{code}=useParams();
  
  useEffect(()=>{
    if(!socket) return;

    //when someone else draw a new line
    const handleIncomingStroke =(strokeData)=>{
      setLines((prevLines)=>[...prevLines,strokeData]);
    }

    const handleRoomState=(roomState)=>{
      if(roomState && roomState.strokes){
        setLines(roomState.strokes);
      }
    }
    
    //wehen we firt join,download the entire cnavas history
    socket.on("draw:stroke",handleIncomingStroke);
    //this executes whenever there is change in room state
    socket.on("room:state",handleRoomState);
    
    // Clear the board when the server says the turn is over!
    socket.on("draw:clear_board", () => setLines([]));
    
    return ()=>{
      socket.off("draw:stroke",handleIncomingStroke);
      socket.off("room:state",handleRoomState);
      socket.off("draw:clear_board");
    }
  },[socket])
  // Fired when the user presses the mouse down to start drawing
  const handleMouseDown = (e) => {

    // Securtity rule: if player not allwed to drawing they cannot draw on board
    if(!isDrawer) return;
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    
    // Create a new line based on where they clicked
    setLines([...lines, { tool: 'pen', color, size: brushSize, points: [pos.x, pos.y] }]);
  };

  // Fired when the user drags the mouse
  const handleMouseMove = (e) => {

    // If they aren't holding the mouse down, do nothing
    if (!isDrawing||!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    // Get the last line drawn and add the new point to it
    let lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Replace the last line in our state array
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  // Fired when the user releases the mouse click
  const handleMouseUp = () => {
    isDrawing.current = false;
    
    // THE STATE WE NEED TO SEND TO THE SERVER:
    const lastLine = lines[lines.length - 1];
    
    if (lastLine) {
      const strokeData = {
        points: lastLine.points,
        color: lastLine.color,
        size: lastLine.size
      };
      
      console.log('Emit this to server:', strokeData);
      // TODO: socket.emit('draw:stroke', strokeData);
      socket.emit("draw:stroke",{code,strokeData});
      
    }
  };

  return (
    <div style={{ border: '2px solid #ccc', display: 'inline-block', backgroundColor: 'white' }}>
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        // These are for touch support (mobile/tablets)
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;
