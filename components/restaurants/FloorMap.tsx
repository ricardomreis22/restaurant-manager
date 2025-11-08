"use client";

import { useState, startTransition, useEffect } from "react";
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
    null
  );
  const [numberOfPeople, setNumberOfPeople] = useState<number>(2);
  const [tablePositions, setTablePositions] = useState<
    Record<number, { x: number; y: number }>
  >({});

  const refreshTables = async () => {
    try {
      const response = await getTables(restaurantId);
      if (response.success) {
        setLocalTables(response.tables);
      }
    } catch (error) {
      console.error("Failed to refresh tables:", error);
    }
  };

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.emit("join-table", restaurantId);

    socket.on("do_something", () => {
      refreshTables();
    });

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  // Update local tables when prop changes
  useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  // Initialize table positions when tables change
  useEffect(() => {
    const initialPositions: Record<number, { x: number; y: number }> = {};
    localTables.forEach((table) => {
      initialPositions[table.id] = {
        x: table.x || 0,
        y: table.y || 0,
      };
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
              : table
          )
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
            : table
        )
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

    // Handle table dragging (only for admin users)
    if (active && String(active.id).startsWith("table-") && isAdminView) {
      const tableId = parseInt(String(active.id).replace("table-", ""));

      const newX = (tablePositions[tableId]?.x || 0) + delta.x;
      const newY = (tablePositions[tableId]?.y || 0) + delta.y;

      // Update local state immediately for responsive UI
      setTablePositions((prevPositions) => ({
        ...prevPositions,
        [tableId]: {
          x: newX,
          y: newY,
        },
      }));

      // Save to database
      try {
        await updateTablePosition(tableId, newX, newY);
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
          <div className="relative h-full bg-gray-50 rounded-l mr-6 ml-6 mb-6 overflow-hidden">
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

            {/* Tables Grid */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 md:w-2/3">
              <div className="h-full w-full overflow-hidden">
                {localTables.map((table) => (
                  <Draggable
                    key={table.id}
                    position={tablePositions[table.id] || { x: 0, y: 0 }}
                    id={`table-${table.id}`}
                    disabled={!isAdminView}
                  >
                    <div
                      onClick={() => handleTableClick(table.id)}
                      className={`
                    relative w-24 h-24 md:w-32 md:h-32 p-2 md:p-4 rounded-lg shadow-md text-center
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
                      <h3 className="font-bold text-sm md:text-lg">
                        Table {table.number}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        Capacity: {table.capacity}
                      </p>
                      <p className="text-xs md:text-sm mt-1">
                        {table.isReserved ? "Reserved" : "Available"}
                      </p>
                      {table.isLocked && (
                        <Lock className="absolute top-2 right-2 h-4 w-4 text-red-500" />
                      )}
                      {isAdminView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 text-red-600 hover:text-red-800 bg-white rounded-full p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTable(table.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
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
