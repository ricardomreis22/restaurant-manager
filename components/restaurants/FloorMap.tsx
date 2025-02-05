import React, { useState } from "react";

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
}

interface FloorMapProps {
  tables: Table[];
  onTableSelect: (tableId: number) => void;
}

const Floormap = ({ tables, onTableSelect }: FloorMapProps) => {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const handleTableClick = (tableId: number) => {
    setSelectedTable(tableId);
    onTableSelect(tableId);
  };

  return (
    <div>
      <div className="h-full bg-gray-50 rounded-lg">
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
            {tables.map((table) => (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`
            p-4 rounded-lg shadow-md text-center cursor-pointer
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
      <div className="absolute bottom-4 left-4 flex gap-4 text-sm text-gray-600">
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
  );
};

export default Floormap;
