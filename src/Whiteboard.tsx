import { useEffect, useRef } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { v4 as uuidv4 } from "uuid";

const Whiteboard = () => {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const elementsRef = useRef<ExcalidrawElement[]>([]);
  const socket = useRef<Socket | null>(null);
  const clientId = useRef(uuidv4());

  useEffect(() => {
    socket.current = io("http://localhost:3001");

    socket.current.once("initialise-canvas", updateCanvas);
    socket.current.on("update-canvas", updateCanvas);

    return () => {
      socket.current?.off("update-canvas", updateCanvas);
      socket.current?.disconnect();
    };
  }, []);

  /* 
          update canvas to match new canvas data 
  */
  const updateCanvas = (canvasData: { updatedElements: ExcalidrawElement[], authorClientId: string }) => {
    const { updatedElements, authorClientId } = canvasData
    // check the update came from somewhere else
    if (clientId.current === authorClientId) {
      return;
    }
    // update state
    elementsRef.current = updatedElements;
    // update canvas
    excalidrawAPIRef.current?.updateScene({
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
    socket.current?.emit("update-canvas", {
      updatedElements,
      authorClientId: clientId.current
    });
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
