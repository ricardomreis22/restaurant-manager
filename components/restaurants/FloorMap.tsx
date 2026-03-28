"use client";

import {
  useState,
  startTransition,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Users, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTable,
  deleteTable,
  getTables,
  toggleTableLock,
  updateTablePosition,
} from "@/actions/tables";
import { toast } from "sonner";
import { TableLocker } from "./TableLocker";
import io from "socket.io-client";
import { checkTableLock } from "@/actions/tables";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Droppable } from "../dnd/Droppable";
import { Draggable } from "../dnd/Draggable";

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
  isLocked: boolean;
  x?: number; // Add this
  y?: number; // Add this
}

interface FloorMapProps {
  tables: Table[];
  onTableSelect: (tableId: number) => void;
  onToggleLock?: (tableId: number, locked: boolean) => void;
  isAdminView?: boolean;
  restaurantId: number;
  restaurantName: string;
  display: string;
  setDisplay: (display: string) => void;
  adminSetDisplay: (display: string) => void;
}

const Floormap = ({
  tables,
  onTableSelect,
  onToggleLock,
  isAdminView = false,
  restaurantId,
}: FloorMapProps) => {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTableIdInput, setDeleteTableIdInput] = useState("");
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [localTables, setLocalTables] = useState(tables);
  const [selectedTableData, setSelectedTableData] = useState<Table | null>(
    null,
  );
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
  const [tablePositions, setTablePositions] = useState<
    Record<number, { x: number; y: number }>
  >({});
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSizePx, setCellSizePx] = useState<number | null>(null);

  const GRID_COLS = 16;
  const GRID_ROWS = 10;
  // Used to convert legacy pixel positions from DB into grid coords
  const REF_CELL_PX = 40;

  // Measure grid to get cell size in pixels for snapping
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (w && h) setCellSizePx(Math.min(w / GRID_COLS, h / GRID_ROWS));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pixelToGrid = useCallback(
    (x: number, y: number) => {
      if (cellSizePx == null || cellSizePx <= 0) return { col: 0, row: 0 };
      const col = Math.round(x / cellSizePx);
      const row = Math.round(y / cellSizePx);
      return {
        col: Math.max(0, Math.min(GRID_COLS - 1, col)),
        row: Math.max(0, Math.min(GRID_ROWS - 1, row)),
      };
    },
    [cellSizePx],
  );

  const gridToPixel = useCallback(
    (col: number, row: number) => {
      if (cellSizePx == null || cellSizePx <= 0) return { x: 0, y: 0 };
      return {
        x: col * cellSizePx,
        y: row * cellSizePx,
      };
    },
    [cellSizePx],
  );

  const snapToGrid = useCallback(
    (x: number, y: number) => {
      const { col, row } = pixelToGrid(x, y);
      return gridToPixel(col, row);
    },
    [pixelToGrid, gridToPixel],
  );

  const TABLE_GAP = 2;

  // pos.x = col, pos.y = row (grid coords). Returns pixel position offset by half the gap so the table is centered in the cell.
  const getDisplayPosition = useCallback(
    (pos: { x: number; y: number }) => {
      if (cellSizePx == null || cellSizePx <= 0)
        return {
          x: pos.x * REF_CELL_PX + TABLE_GAP / 2,
          y: pos.y * REF_CELL_PX + TABLE_GAP / 2,
        };
      const px = gridToPixel(pos.x, pos.y);
      return { x: px.x + TABLE_GAP / 2, y: px.y + TABLE_GAP / 2 };
    },
    [cellSizePx, gridToPixel],
  );

  const refreshTables = useCallback(async () => {
    try {
      const response = await getTables(restaurantId);
      if (response.success) {
        setLocalTables(response.tables);
      }
    } catch (error) {
      console.error("Failed to refresh tables:", error);
    }
  }, [restaurantId]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl);

    socket.emit("join-table", restaurantId);

    socket.on("do_something", () => {
      refreshTables();
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId, refreshTables]);

  // Update local tables when prop changes
  useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  // Initialize table positions: store as grid (col, row) so cell is fixed across screen sizes
  useEffect(() => {
    const initialPositions: Record<number, { x: number; y: number }> = {};
    localTables.forEach((table) => {
      let x = table.x ?? 0;
      let y = table.y ?? 0;
      // If values look like pixels (legacy), convert to grid coords
      if (x > GRID_COLS - 1 || y > GRID_ROWS - 1) {
        x = Math.max(0, Math.min(GRID_COLS - 1, Math.round(x / REF_CELL_PX)));
        y = Math.max(0, Math.min(GRID_ROWS - 1, Math.round(y / REF_CELL_PX)));
      }
      initialPositions[table.id] = { x, y };
    });
    setTablePositions(initialPositions);
  }, [localTables]);

  const handleTableClick = async (tableId: number) => {
    const table = localTables.find((t) => t.id === tableId);
    if (table?.isLocked) {
      // Don't allow interaction with locked tables
      return;
    }

    if (table?.isReserved) {
      if (await checkTableLock(tableId)) return;

      try {
        // Update the table capacity and lock it
        await toggleTableLock(tableId, true);
        // Update local state
        setLocalTables((tables) =>
          tables.map((table) =>
            table.id === tableId
              ? {
                  ...table,
                  capacity: numberOfPeople,
                  isReserved: true,
                  isLocked: true,
                }
              : table,
          ),
        );
      } catch (error) {
        console.error("Failed to lock table:", error);
        toast.error("Failed to lock table");
      }
      setSelectedTable(table.id);
      onTableSelect(table.id);
      router.push(`/restaurants/${restaurantId}/tables/${table.id}`);
    } else {
      setSelectedTable(tableId);
      setSelectedTableData(table || null);
      setNumberOfPeople(table?.capacity || 2);
      setIsSeatModalOpen(true);
    }
  };

  const handleConfirmSeating = async () => {
    if (!selectedTable) return;
    if (await checkTableLock(selectedTable)) return;

    try {
      // Update the table capacity and lock it
      await toggleTableLock(selectedTable, true);
      // Update local state
      setLocalTables((tables) =>
        tables.map((table) =>
          table.id === selectedTable
            ? {
                ...table,
                capacity: numberOfPeople,
                isReserved: true,
                isLocked: true,
              }
            : table,
        ),
      );
      // Close the modal and navigate to the table
      setIsSeatModalOpen(false);
      onTableSelect(selectedTable);
      router.push(`/restaurants/${restaurantId}/tables/${selectedTable}`);
    } catch (error) {
      console.error("Failed to confirm seating:", error);
      toast.error("Failed to confirm seating");
    }
  };

  // ADMIN ONLY ///////////////////////////////////////////////////////////////
  const handleAddTable = () => {
    setIsPending(true);
    const tableId = parseInt(tableNumber);

    startTransition(() => {
      createTable({
        id: tableId,
        number: tableId,
        capacity: 2,
        restaurantId,
      })
        .then((response) => {
          if (response.success) {
            setIsAddModalOpen(false);
            setTableNumber("");
            refreshTables();
          }
        })
        .catch((error) => {
          console.error("Failed to add table:", error);
        })
        .finally(() => {
          setIsPending(false);
        });
    });
  };

  const executeDeleteTable = (tableId: number) => {
    const tableToDelete = localTables.find((table) => table.id === tableId);
    if (tableToDelete?.isReserved) {
      toast.error("Cannot delete reserved tables");
      return;
    }

    setIsPending(true);
    startTransition(() => {
      deleteTable(tableId)
        .then((response) => {
          if (response.success) {
            refreshTables();
            setTablePositions((prev) => {
              const next = { ...prev };
              delete next[tableId];
              return next;
            });
            toast.success("Table deleted");
          }
        })
        .catch((error) => {
          console.error("Failed to delete table:", error);
          toast.error("Failed to delete table");
        })
        .finally(() => {
          setIsPending(false);
        });
    });
  };

  const handleDeleteTableFromModal = () => {
    const id = parseInt(deleteTableIdInput, 10);
    if (Number.isNaN(id) || id < 1) {
      toast.error("Enter a valid table number");
      return;
    }
    setIsDeleteModalOpen(false);
    setDeleteTableIdInput("");
    executeDeleteTable(id);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (!over) return;

    if (active && String(active.id).startsWith("table-") && isAdminView) {
      const tableId = parseInt(String(active.id).replace("table-", ""));
      const current = tablePositions[tableId] || { x: 0, y: 0 };
      // current is (col, row); get pixel position, add delta, snap to cell
      const currentPx =
        cellSizePx != null
          ? gridToPixel(current.x, current.y)
          : { x: current.x * REF_CELL_PX, y: current.y * REF_CELL_PX };
      const newPx = { x: currentPx.x + delta.x, y: currentPx.y + delta.y };
      const snappedPx =
        cellSizePx != null ? snapToGrid(newPx.x, newPx.y) : newPx;
      const { col, row } =
        cellSizePx != null
          ? pixelToGrid(snappedPx.x, snappedPx.y)
          : {
              col: Math.max(
                0,
                Math.min(GRID_COLS - 1, Math.round(newPx.x / REF_CELL_PX)),
              ),
              row: Math.max(
                0,
                Math.min(GRID_ROWS - 1, Math.round(newPx.y / REF_CELL_PX)),
              ),
            };
      const gridPos = { x: col, y: row };

      setTablePositions((prev) => ({ ...prev, [tableId]: gridPos }));

      try {
        await updateTablePosition(tableId, gridPos.x, gridPos.y);
      } catch (error) {
        console.error("Failed to update table position:", error);
        toast.error("Failed to save table position");
      }
    }
  };

  /////////////////////////////////////////////////////////////////////////////

  return (
    <div className="flex h-full w-full min-h-0 flex-col">
      <div className="flex min-h-0 items-center justify-center py-6 px-0 md:px-6">
        <DndContext onDragEnd={handleDragEnd}>
          <Droppable id="floor-map">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-l lg:justify-end">
              <div className="relative w-full xl:w-[66%] xl:mr-10">
                <div className="relative w-full aspect-[16/10] min-h-0">
                  <div
                    ref={gridRef}
                    className="absolute inset-0 z-0 rounded-lg overflow-hidden border-2 border-gray-300 bg-white"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(16, minmax(0, 1fr))",
                      gridTemplateRows: "repeat(10, minmax(0, 1fr))",
                      backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
                  `,
                      backgroundSize: "calc(100% / 16) calc(100% / 10)",
                      backgroundColor: "white",
                      ["--cell-size" as string]: "calc(100% / 16)",
                    }}
                  >
                    <div className="col-span-full row-span-full relative">
                      <div className="absolute inset-0 overflow-hidden">
                        {localTables.map((table) => (
                          <Draggable
                            key={table.id}
                            position={getDisplayPosition(
                              tablePositions[table.id] || { x: 0, y: 0 },
                            )}
                            id={`table-${table.id}`}
                            disabled={!isAdminView}
                          >
                            <div
                              onClick={() => handleTableClick(table.id)}
                              className={`
                    relative flex items-center justify-center box-border rounded-md shadow-md
                    ${table.isLocked ? "cursor-not-allowed" : "cursor-pointer"}
                    ${table.isReserved ? "bg-yellow-100" : "bg-green-100"}
                    ${selectedTable === table.id ? "ring-2 ring-blue-500" : ""}
                    hover:shadow-lg transition-all
                  `}
                              style={{
                                width:
                                  cellSizePx != null
                                    ? `${cellSizePx}px`
                                    : "2.5rem",
                                height:
                                  cellSizePx != null
                                    ? `${cellSizePx}px`
                                    : "2.5rem",
                              }}
                            >
                              <h3 className="text-center text-sm font-bold leading-none text-primary md:text-lg">
                                {table.number}
                              </h3>

                              <p className="hidden text-xs md:text-sm mt-1">
                                {table.isReserved ? "Reserved" : "Available"}
                              </p>
                              {table.isLocked && (
                                <Lock className="absolute right-0 top-0 h-3 w-3 text-red-600 md:h-4 md:w-4" />
                              )}

                              {onToggleLock && (
                                <TableLocker
                                  tableId={table.id}
                                  isLocked={table.isLocked}
                                  onToggleLock={onToggleLock}
                                />
                              )}
                            </div>
                          </Draggable>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Droppable>
        </DndContext>
      </div>
      {isAdminView && (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-4 sm:px-0">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="outline"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Button>
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            variant="outline"
            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Table
          </Button>
        </div>
      )}

      {/* Add Table Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Enter table number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTable} disabled={isPending}>
              {isPending ? "Adding..." : "Add Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete table</DialogTitle>
            <DialogDescription>
              Select a table to remove it from the floor map.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deleteTableId">Table number</Label>
              <Select
                value={deleteTableIdInput}
                onValueChange={setDeleteTableIdInput}
              >
                <SelectTrigger id="deleteTableId">
                  <SelectValue placeholder="Choose a table" />
                </SelectTrigger>
                <SelectContent>
                  {localTables
                    .slice()
                    .sort((a, b) => a.number - b.number)
                    .map((table) => (
                      <SelectItem key={table.id} value={String(table.id)}>
                        Table {table.number}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteTableIdInput("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTableFromModal}
              disabled={isPending || !deleteTableIdInput}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Seating Modal */}
      <Dialog open={isSeatModalOpen} onOpenChange={setIsSeatModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Table {selectedTableData?.number}</DialogTitle>
            <DialogDescription>
              How many people will be seated at this table?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setNumberOfPeople((prev) => Math.max(1, prev - 1))
                }
                disabled={numberOfPeople <= 1}
              >
                -
              </Button>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-2xl font-semibold">{numberOfPeople}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setNumberOfPeople((prev) => Math.min(12, prev + 1))
                }
                disabled={numberOfPeople >= 12}
              >
                +
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSeatModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSeating}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Floormap;
