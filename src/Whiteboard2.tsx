// TODO
// in handleChange only send the dif
// fix resizing only one can do it
// initialise with canvas data

import { useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const Whiteboard = () => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const elementsRef = useRef<ExcalidrawElement[]>([])
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    
    socket.current = io("http://localhost:3001");

    socket.current.on("update-canvas", updateCanvas);

    return () => {
    console.log("Ranx");
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const updateCanvas = (data: any) => {
    const sortedDataElements = JSON.stringify(data.elements.map((el: ExcalidrawElement) => {
      const { updated, ...rest } = el;
      return rest;
    }).sort((a, b) => a.id.localeCompare(b.id)));

    const sortedElements = JSON.stringify(elementsRef.current.map(el => {
      const { updated, ...rest } = el;
      return rest;
    }).sort((a, b) => a.id.localeCompare(b.id)));

    if (excalidrawAPIRef.current) {
      if (sortedDataElements !== sortedElements) {
        console.log("ran**")

        elementsRef.current = data.elements;

        excalidrawAPIRef.current.updateScene({
          elements: data.elements
        });
      }
    }
  }

  const handleChange = (updatedElements: readonly ExcalidrawElement[]) => {
    // check if elements have changed
    let elementsHaveChanged = false

    if (updatedElements.length !== elementsRef.current.length) {
      elementsHaveChanged = true
    } else {
      for (let index = 0; index < updatedElements.length; index++) {
        if (JSON.stringify(updatedElements[index]) !== JSON.stringify(elementsRef.current[index])) {
          elementsHaveChanged = true
          break
        }
      }
    }

    if (!elementsHaveChanged) {
      return
    }

    console.log("ran*")
    elementsRef.current = (JSON.parse(JSON.stringify(updatedElements)));

    if (socket.current) {
      socket.current.emit("update-canvas", {
        elements: updatedElements
      });
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Excalidraw
        excalidrawAPI={(excalidrawAPI) => excalidrawAPIRef.current = excalidrawAPI}
        onChange={handleChange}
        initialData={{ elements: elementsRef.current }} />
    </div>
  );
};

export default Whiteboard;
