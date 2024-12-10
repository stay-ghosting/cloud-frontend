// TODO
// fix resizing only one can do it

import { useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const Whiteboard = () => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const elementsRef = useRef<ExcalidrawElement[]>([]);
  const socket = useRef<Socket | null>(null);


  useEffect(() => {
    socket.current = io("http://localhost:3001");

    socket.current.once("initialise-canvas", updateCanvas);
    socket.current.on("update-canvas", updateCanvas);

    return () => {
      if (socket.current) {
        socket.current.off("update-canvas", updateCanvas);
        socket.current.disconnect();
      }
    };
  }, []);

  /* 
          update canvas to match new canvas data 
  */
  const updateCanvas = (canvasData: { elements: ExcalidrawElement[] }) => {
    // check we have a canvas
    if (!excalidrawAPIRef.current) {
      return;
    }

    // check that the update contains a difference
    const updatedElements = canvasData.elements;

    const updatedElementsJSON = JSON.stringify(updatedElements);
    const currentElementsJSON = JSON.stringify(elementsRef.current);

    if (updatedElementsJSON === currentElementsJSON) {
      return;
    }

    // make updates
    elementsRef.current = updatedElements;

    excalidrawAPIRef.current.updateScene({
      elements: updatedElements,
    });
  };

  /* 
          emit an event if canvas has an update 
  */
  const handleChange = (updatedElements: readonly ExcalidrawElement[]) => {
    
    // check if elements have changed
    let elementsHaveChanged =
    updatedElements.length !== elementsRef.current.length || 
    updatedElements.some((element, index) => JSON.stringify(element) !== JSON.stringify(elementsRef.current[index]));
    
    if (!elementsHaveChanged) {
      return;
    }
    
    // update the state
    elementsRef.current = JSON.parse(JSON.stringify(updatedElements));
    // emit an event
    if (socket.current) {
      socket.current.emit("update-canvas", {
        elements: updatedElements,
      });
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Excalidraw 
        excalidrawAPI={(excalidrawAPI) => (excalidrawAPIRef.current = excalidrawAPI)} 
        onChange={handleChange} />
    </div>
  );
};

export default Whiteboard;
