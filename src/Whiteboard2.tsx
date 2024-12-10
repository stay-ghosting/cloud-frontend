// TODO
// in handleChange only send the dif

import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, Socket } from "socket.io-client";
import { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const Whiteboard = () => {


  // useEffect(() => {
  //   socket.current = io("http://localhost:3001");

  //   socket.current.on("update-canvas", updateCanvas);

  //   return () => {
  //     if (socket.current) {
  //       socket.current.disconnect();
  //     }
  //   };
  // }, [excalidrawAPI]);

  // const updateCanvas = (data: any) => {
  //   const sortedDataElements = JSON.stringify(data.elements.map((el: ExcalidrawElement) => {
  //     const { updated, ...rest } = el;
  //     return rest;
  //   }).sort((a, b) => a.id.localeCompare(b.id)));

  //   const sortedElements = JSON.stringify(elementData.current.map(el => {
  //     const { updated, ...rest } = el;
  //     return rest;
  //   }).sort((a, b) => a.id.localeCompare(b.id)));

  //   if (excalidrawAPI) {
  //     if (sortedDataElements !== sortedElements) {
  //       console.log("ran**")

  //       elementData.current = data.elements;

  //       excalidrawAPI.updateScene({
  //         elements: data.elements,
  //         // appState: data.appState,
  //         collaborators: data.collaborators
  //       });
  //     }
  //   }
  // }

  const elementData = useRef<ExcalidrawElement[]>([])
  const elementData2 = useRef<ExcalidrawElement[]>([])

  const handleChange = (updatedElements: readonly ExcalidrawElement[]) => {
    // console.log(JSON.stringify(elementData));

    // if (JSON.stringify(Array.from(updatedElements)[0]) !== JSON.stringify(elementData2.current[0])) {
    //   console.log(true);
    // }

    if (JSON.stringify(elementData.current[0]) !== JSON.stringify(updatedElements[0])) {
      console.log(true);
    }

    elementData.current = JSON.parse(JSON.stringify([...updatedElements]));

    // let elementsHaveChanged = false

    // if (updatedElements.length !== elementData.current.length) {
    //   elementsHaveChanged = true
    // } else {
    //   for (let index = 0; index < updatedElements.length; index++) {
    //     // console.log(
    //     //   JSON.stringify(updatedElements[index]), "***", JSON.stringify(elementData.current[index])
    //     // );

    //     if (JSON.stringify(updatedElements[index]) !== JSON.stringify(elementData.current[index])) {
    //       elementsHaveChanged = true
    //       break
    //     }
    //   }
    // }

    // if (!elementsHaveChanged) {
    //   return
    // }

    // console.log("ran*")


    // elementData.current = Array.from(updatedElements);

    // if (socket.current) {
    //   socket.current.emit("update-canvas", {
    //     elements: updatedElements
    //   });
    // }
  };

  return (
    <div style={{ height: "800px", width: "800px" }}>
      <h1>Whiteboard</h1>
      <Excalidraw
        onChange={handleChange}

      // initialData={{ elements: elementData.current }}
      />
    </div>
  );
};

export default Whiteboard;
