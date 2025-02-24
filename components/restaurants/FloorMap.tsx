"use client";

import React, { useState, startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTable, deleteTable, getTables } from "@/actions/tables";

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
}

interface FloorMapProps {
  tables: Table[];
  onTableSelect: (tableId: number) => void;
  isAdminView?: boolean;
  restaurantId: number;
}

const Floormap = ({
  tables,
  onTableSelect,
  isAdminView = false,
  restaurantId,
}: FloorMapProps) => {
  const router = useRouter();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [localTables, setLocalTables] = useState(tables);

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

  // Update local tables when prop changes
  useEffect(() => {
    setLocalTables(tables);
  }, [tables]);

  const handleTableClick = (tableId: number) => {
    setSelectedTable(tableId);
    onTableSelect(tableId);
    router.push(`/restaurants/${restaurantId}/tables/${tableId}`);
  };

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

  return (
    <div className="relative h-full">
      <div className="h-full bg-gray-50 rounded-lg">
        {/* Add Table Button - Top Right */}
        {isAdminView && (
          <div className="absolute top-4 right-4 z-10">
            <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </div>
        )}

        {/* Kitchen - Left Side */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-24 h-48 bg-gray-200 rounded-r-lg flex items-center justify-center">
          <span className="font-semibold text-gray-700 -rotate-90">
            Kitchen
          </span>
        </div>

        {/* Entrance - Right Side */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-32 flex flex-col items-center justify-center">
          <div className="w-12 h-20 border-2 border-gray-400 rounded-r-lg"></div>
          <span className="mt-2 text-sm text-gray-700">Entrance</span>
        </div>

        {/* Tables Grid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {localTables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`
                  relative p-4 rounded-lg shadow-md text-center cursor-pointer
                  ${table.isReserved ? "bg-yellow-100" : "bg-green-100"}
                  ${selectedTable === table.id ? "ring-2 ring-blue-500" : ""}
                  hover:shadow-lg transition-all
                `}
              >
                <h3 className="font-bold text-lg">Table {table.number}</h3>
                <p className="text-sm text-gray-600">
                  Capacity: {table.capacity}
                </p>
                <p className="text-sm mt-1">
                  {table.isReserved ? "Reserved" : "Available"}
                </p>
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
              </div>
            ))}
          </div>
        </div>

        {/* Bar - Bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <span className="font-semibold text-gray-700">Bar</span>
        </div>
      </div>

      {/* Legend */}
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
    </div>
  );
};

export default Floormap;
