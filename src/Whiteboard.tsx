import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const Whiteboard = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const elementsRef = useRef(elements)
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    elementsRef.current = elements
  }, [elements]);

  useEffect(() => {
    socket.current = io("http://localhost:3001");

    socket.current.on("update-canvas", (data) => {
      console.log(JSON.stringify(data.elements));
      console.log("**************");
      console.log(JSON.stringify(elementsRef));

      const sortedDataElements = JSON.stringify(data.elements.map(el => {
        const { updated, ...rest } = el;
        return rest;
      }).sort((a, b) => a.id.localeCompare(b.id)));

      const sortedElements = JSON.stringify(elementsRef.current.map(el => {
        const { updated, ...rest } = el;
        return rest;
      }).sort((a, b) => a.id.localeCompare(b.id)));

      if (excalidrawAPI) {
        if (sortedDataElements !== sortedElements) {
          console.log(false);

          setElements(data.elements);

          excalidrawAPI.updateScene({
            elements: data.elements,
            // appState: data.appState,
            collaborators: data.collaborators
          });
        }
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [excalidrawAPI]);

  const handleChange = (updatedElements: readonly ExcalidrawElement[]) => {
    const elementsNotChanged = JSON.stringify(elements) === JSON.stringify(updatedElements);
    console.log(elementsNotChanged)

    if (elementsNotChanged) {
      return
    }

    setElements(Array.from(updatedElements));

    if (socket.current) {
      socket.current.emit("update-canvas", {
        elements: updatedElements,
        // collaborators: [
        //   { id: 1, name: "John Doe" },
        //   { id: 2, name: "Jane Smith" },
        //   { id: 3, name: "Sam Wilson" },
        // ],
      });
    }
  };

  return (
    <div style={{ height: "800px", width: "800px" }}>
      <h1>Whiteboard</h1>
      <Excalidraw
        excalidrawAPI={setExcalidrawAPI}
        onChange={(updatedElements) => handleChange(updatedElements)}
        initialData={{ elements }}
      />
    </div>
  );
};

export default Whiteboard;
