import { useDroppable } from "@dnd-kit/core";

export function Droppable(props: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  const style = {
    color: isOver ? "green" : undefined,
    height: "100%",
    width: "100%",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-droppable-id={props.id}
      className={props.className}
    >
      {props.children}
    </div>
  );
}
