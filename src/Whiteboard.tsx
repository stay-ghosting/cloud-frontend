import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const Whiteboard = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [elements, setElements] = useState<ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState({});
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io("http://localhost:3001");

    socket.current.on("update-canvas", (data) => {
      if (excalidrawAPI) {
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: data.appState,
        });
      }
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const handleChange = (updatedElements: readonly ExcalidrawElement[], updatedAppState: AppState) => {
    const elementsChanged = JSON.stringify(elements) !== JSON.stringify(updatedElements);
    const appStateChanged = JSON.stringify(appState) !== JSON.stringify(updatedAppState);
    
    if (elementsChanged) {
      setElements(Array.from(updatedElements));
    }
    
    if (appStateChanged) {
      setAppState(updatedAppState);
    }

    if (socket.current) {
      socket.current.emit("update-canvas", {
        elements: updatedElements,
        appState: updatedAppState,
      });
    }
  };

  return (
    <div style={{ height: "800px", width: "800px" }}>
      <h1>hello world</h1>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)} 
        onChange={(updatedElements, updatedAppState) =>
          handleChange(updatedElements, updatedAppState)
        }
        initialData={{ elements, appState }}
      />
      <Excalidraw/>
    </div>
  );
};

export default Whiteboard;
