import { useDroppable } from "@dnd-kit/core";

export function Droppable(props: any) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const style = {
    color: isOver ? "green" : undefined,
    height: "100%",
    width: "100%",
  };

  return (
    <div ref={setNodeRef} style={style} data-droppable-id={props.id}>
      {props.children}
    </div>
  );
}
