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

  const handleDeleteTable = (tableId: number) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      setIsPending(true);
      startTransition(() => {
        deleteTable(tableId)
          .then((response) => {
            if (response.success) {
              refreshTables();
            }
          })
          .catch((error) => {
            console.error("Failed to delete table:", error);
          })
          .finally(() => {
            setIsPending(false);
          });
      });
    }
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
<<<<<<< Updated upstream
    <div className="h-full">
      <DndContext onDragEnd={handleDragEnd}>
        <Droppable id="floor-map">
          <div
            className="relative bg-gray-50 rounded-lg overflow-hidden w-full max-h-full lg:max-h-[85%] min-w-0"
            style={{ aspectRatio: "4/3" }}
          >
            {/* Add Table Button - Top Right */}
            {isAdminView && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Table
                </Button>
              </div>
            )}

            {/* Tables Grid - fills entire floor-map so tables can go edge to edge */}
            <div className="absolute inset-0 min-h-[200px]">
              <div
                ref={mapContainerRef}
                className="h-full w-full relative min-h-[200px]"
              >
                {localTables.map((table) => {
                  const pos = displayPositions[table.id] ?? { x: 0, y: 0 };
                  const pixelX = pos.x * mapSize.width;
                  const pixelY = pos.y * mapSize.height;
                  const tableSize = getTableSize(mapSize.width, mapSize.height);
                  return (
                    <Draggable
                      key={table.id}
                      position={{ x: pixelX, y: pixelY }}
                      id={`table-${table.id}`}
                      disabled={!isAdminView}
                    >
                      <div
                        onClick={() => handleTableClick(table.id)}
                        style={{
                          width: `${tableSize.width}px`,
                          height: `${tableSize.height}px`,
                          minWidth: 0,
                          minHeight: 0,
                          boxSizing: "border-box",
                          overflow: "hidden",
                          padding: `${Math.max(2, Math.min(12, Math.round(tableSize.width * 0.08)))}px`,
                          borderRadius: `${Math.max(4, Math.round(tableSize.width * 0.06))}px`,
                        }}
                        className={`
                    relative shadow-md flex items-center justify-center md:block text-center
=======
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 flex items-start justify-center lg:justify-end rounded-l overflow-hidden">
        <DndContext onDragEnd={handleDragEnd}>
          <Droppable id="floor-map">
          <div className="h-full flex items-start justify-center lg:justify-end overflow-hidden">
            {/* 16:10 aspect ratio on all screens; on lg fixed 640px width, right-aligned */}
            <div
              className="relative w-full xl:w-[66%] xl:mr-10 "
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
                  // Each cell is square; one cell = 100%/16 = 100%/10
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
                    relative text-center box-border rounded-md shadow-md
>>>>>>> Stashed changes
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
                          Capacity: {table.capacity}
                        </p>
                        <p
                          className="hidden md:block mt-0.5"
                          style={{
                            fontSize: `${Math.max(10, Math.min(14, Math.round(tableSize.width * 0.12)))}px`,
                          }}
                        >
                          {table.isReserved ? "Reserved" : "Available"}
                        </p>
                        {table.isLocked && (
                          <Lock
                            className="absolute top-[0.125rem] right-[0.125rem] md:top-2 md:right-2 text-red-500 shrink-0"
                            style={{
                              width: `${Math.max(10, Math.min(16, Math.round(tableSize.width * 0.12)))}px`,
                              height: `${Math.max(10, Math.min(16, Math.round(tableSize.width * 0.12)))}px`,
                            }}
                          />
                        )}
                        {isAdminView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-1 -right-1 md:-top-2 md:-right-2 text-red-600 hover:text-red-800 bg-white rounded-full min-w-0 h-auto"
                            style={{
                              padding: `${Math.max(2, Math.round(tableSize.width * 0.04))}px`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTable(table.id);
                            }}
                          >
                            <Trash
                              className="shrink-0"
                              style={{
                                width: `${Math.max(10, Math.min(16, Math.round(tableSize.width * 0.12)))}px`,
                                height: `${Math.max(10, Math.min(16, Math.round(tableSize.width * 0.12)))}px`,
                              }}
                            />
                          </Button>
                        )}
                        {onToggleLock && (
                          <div className="hidden md:block">
                            <TableLocker
                              tableId={table.id}
                              isLocked={table.isLocked}
                              onToggleLock={onToggleLock}
                            />
                          </div>
                        )}
                      </div>
                    </Draggable>
                  );
                })}
              </div>
            </div>

            {/* Legend absolutely positioned in the bottom left of the white div */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4">
              <div className="flex gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span>Reserved</span>
                </div>
              </div>
            </div>
          </div>
        </Droppable>
      </DndContext>
      </div>
      {/* Add Table Button - below the droppable area */}
      {isAdminView && (
        <div className="flex justify-end items-center gap-2 pt-4 pb-2 flex-shrink-0">
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Table
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
