import React from "react";
import { useDraggable } from "@dnd-kit/core";

export function Draggable(props: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
    disabled: props.disabled,
  });

  // Combine the stored position with the current transform during drag
  const style = {
    position: "absolute" as const,
    left: `${props.position.x}px`, // Base position
    top: `${props.position.y}px`, // Base position
    // Show real-time movement during drag
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: transform ? 1000 : 50,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}
