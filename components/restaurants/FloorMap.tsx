"use client";

import {
  useState,
  startTransition,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
  const [tableToDeleteId, setTableToDeleteId] = useState<number | null>(null);
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
  >({}); // x,y are ratios 0-1
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({
    width: REFERENCE_MAP_WIDTH,
    height: REFERENCE_MAP_HEIGHT,
  });
  const tablePositionsRef = useRef(tablePositions);
  const mapSizeRef = useRef(mapSize);
  const displayPositionsRef = useRef<Record<number, { x: number; y: number }>>(
    {},
  );
  tablePositionsRef.current = tablePositions;
  mapSizeRef.current = mapSize;

  const updateMapSize = useCallback(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const w = rect.width || REFERENCE_MAP_WIDTH;
    const h = rect.height || REFERENCE_MAP_HEIGHT;
    setMapSize({ width: w, height: h });
  }, []);

  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    updateMapSize();
    requestAnimationFrame(updateMapSize);
    const ro = new ResizeObserver(updateMapSize);
    ro.observe(el);
    const onResize = () => {
      requestAnimationFrame(() => requestAnimationFrame(updateMapSize));
    };
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [updateMapSize]);

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

  // Set positions from server only for tables that don't have one yet (never overwrite after user has dragged).
  useEffect(() => {
    const w = mapSize.width > 0 ? mapSize.width : REFERENCE_MAP_WIDTH;
    const h = mapSize.height > 0 ? mapSize.height : REFERENCE_MAP_HEIGHT;
    const { width: tw, height: th } = getTableSize(w, h);
    const maxRx = w > tw ? 1 - tw / w : 0;
    const maxRy = h > th ? 1 - th / h : 0;

    setTablePositions((prev) => {
      let changed = false;
      const next: Record<number, { x: number; y: number }> = {};
      localTables.forEach((table) => {
        if (prev[table.id] !== undefined) {
          next[table.id] = prev[table.id];
          return;
        }
        changed = true;
        let rx = table.x ?? 0;
        let ry = table.y ?? 0;
        if (rx > 1 || ry > 1) {
          rx = Math.max(0, Math.min(maxRx, rx / REFERENCE_MAP_WIDTH));
          ry = Math.max(0, Math.min(maxRy, ry / REFERENCE_MAP_HEIGHT));
        } else {
          rx = Math.max(0, Math.min(maxRx, rx));
          ry = Math.max(0, Math.min(maxRy, ry));
        }
        next[table.id] = { x: rx, y: ry };
      });
      if (!changed && Object.keys(prev).length === Object.keys(next).length)
        return prev;
      return next;
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

  const handleConfirmDeleteTable = () => {
    if (tableToDeleteId == null) return;
    setIsPending(true);
    startTransition(() => {
      deleteTable(tableToDeleteId, restaurantId)
        .then((response) => {
          if (response.success) {
            setIsDeleteModalOpen(false);
            setTableToDeleteId(null);
            refreshTables();
            toast.success("Table deleted");
          } else {
            toast.error(response.error ?? "Failed to delete table");
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (!over) {
      return; // Exit early if not dropped on anything
    }

    // Handle table dragging (only for admin users): update ratio from sides
    if (active && String(active.id).startsWith("table-") && isAdminView) {
      const tableId = parseInt(String(active.id).replace("table-", ""));
      const { width: wRaw, height: hRaw } = mapSizeRef.current;
      const w = wRaw > 0 ? wRaw : REFERENCE_MAP_WIDTH;
      const h = hRaw > 0 ? hRaw : REFERENCE_MAP_HEIGHT;

      const rx =
        displayPositionsRef.current[tableId]?.x ??
        tablePositionsRef.current[tableId]?.x ??
        0;
      const ry =
        displayPositionsRef.current[tableId]?.y ??
        tablePositionsRef.current[tableId]?.y ??
        0;
      const newPixelX = rx * w + delta.x;
      const newPixelY = ry * h + delta.y;
      const { width: tw, height: th } = getTableSize(w, h);
      const maxRx = w > tw ? 1 - tw / w : 0;
      const maxRy = h > th ? 1 - th / h : 0;
      let newRx = Math.max(0, Math.min(maxRx, newPixelX / w));
      let newRy = Math.max(0, Math.min(maxRy, newPixelY / h));
      const resolved = resolveOverlap(
        tableId,
        newRx,
        newRy,
        { ...tablePositionsRef.current, [tableId]: { x: newRx, y: newRy } },
        w,
        h,
        maxRx,
        maxRy,
      );
      newRx = resolved.rx;
      newRy = resolved.ry;

      setTablePositions((prev) => ({
        ...prev,
        [tableId]: { x: newRx, y: newRy },
      }));

      try {
        await updateTablePosition(tableId, newRx, newRy);
      } catch (error) {
        console.error("Failed to update table position:", error);
        toast.error("Failed to save table position");
      }
    }
  };

  /////////////////////////////////////////////////////////////////////////////

  return (
    <div className="h-full">
      <DndContext onDragEnd={handleDragEnd}>
        <Droppable id="floor-map">
          <div className="h-full flex flex-col items-center justify-start lg:items-end rounded-l mb-6 overflow-hidden">
            {/* 16:10 aspect ratio */}
            <div
              className="relative w-full xl:w-[66%] xl:mr-10"
              style={{ aspectRatio: "16/10" }}
            >
              <div
                ref={gridRef}
                className="absolute inset-0 rounded-lg overflow-hidden border-2 border-gray-300 bg-white"
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
                {/* Content spans the full 16x10 grid */}
                <div className="col-span-full row-span-full relative">
                  {/* Tables area: fills grid so tables can use --cell-size */}
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
                    relative flex flex-col items-center justify-center text-center box-border rounded-md shadow-md
                    ${
                      table.isLocked
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                    ${table.isReserved ? "bg-yellow-100" : "bg-green-100"}
                    ${selectedTable === table.id ? "ring-2 ring-blue-500" : ""}
                    hover:shadow-lg transition-all
                  `}
                      >
                        {/* Small screens: only table number */}
                        <span
                          className="font-bold md:hidden"
                          style={{
                            fontSize: `${Math.max(10, Math.min(18, Math.round(tableSize.width * 0.22)))}px`,
                          }}
                        >
                          {table.number}
                        </span>
                        {/* Medium screens and up: full table info */}
                        <h3
                          className="hidden md:block font-bold"
                          style={{
                            fontSize: `${Math.max(11, Math.min(20, Math.round(tableSize.width * 0.16)))}px`,
                          }}
                        >
                          Table {table.number}
                        </h3>
                        <p
                          className="hidden md:block text-gray-600 mt-0.5"
                          style={{
                            fontSize: `${Math.max(10, Math.min(14, Math.round(tableSize.width * 0.12)))}px`,
                          }}
                        >
                          <h3 className="font-bold text-sm md:text-lg text-black">
                            <span className="hidden">Table</span> {table.number}
                          </h3>
                          <p className="hidden text-xs md:text-sm text-gray-600">
                            Capacity: {table.capacity}
                          </p>
                          <p className="hidden text-xs md:text-sm mt-1">
                            {table.isReserved ? "Reserved" : "Available"}
                          </p>
                          {table.isLocked && (
                            <Lock className="absolute top-1 right-1 h-2 w-2 md:h-4 md:w-4 text-red-500" />
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
            {/* Legend underneath the grid - left side, white text */}
            <div className="flex justify-start gap-4 text-sm text-white my-2 w-full self-start xl:w-[66%] xl:mr-10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded" />
                <span>Reserved</span>
              </div>
            </div>
            {/* Add Table and Delete Table buttons - bigger gap from legend */}
            {isAdminView && (
              <div className="mt-6 mb-2 w-full self-start xl:w-[66%] xl:mr-10 flex flex-col gap-2">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  variant="outline"
                  className="w-full text-black border-white bg-white hover:bg-white/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="outline"
                  className="w-full text-black border-white bg-white hover:bg-white/90"
                >
                  <Trash className="h-4 w-4 mr-2 text-red-600" />
                  Delete Table
                </Button>
              </div>
            )}
          </div>
        </Droppable>
      </DndContext>

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

      {/* Delete Table Modal */}
      <Dialog
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) setTableToDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
            <DialogDescription>
              Choose which table to delete. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Table to delete</Label>
              <Select
                value={tableToDeleteId != null ? String(tableToDeleteId) : ""}
                onValueChange={(v) => setTableToDeleteId(v ? parseInt(v, 10) : null)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {localTables.map((table) => (
                    <SelectItem key={table.id} value={String(table.id)}>
                      Table {table.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {localTables.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No tables to delete.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteTable}
              disabled={isPending || tableToDeleteId == null}
            >
              {isPending ? "Deleting..." : "Delete Table"}
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
