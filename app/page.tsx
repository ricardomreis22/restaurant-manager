"use client";

import Link from "next/link";
import { useState } from "react";
import { Table } from "./types";

const initialTables: Table[] = [
  { id: 1, tableNumber: "T1", capacity: 2, status: "available" },
  { id: 2, tableNumber: "T2", capacity: 2, status: "available" },
  { id: 3, tableNumber: "T3", capacity: 2, status: "available" },
  { id: 4, tableNumber: "T4", capacity: 2, status: "available" },
  { id: 5, tableNumber: "T5", capacity: 2, status: "available" },
];

export default function RestaurantLayout() {
  const [tables, setTables] = useState<Table[]>(initialTables);

  const getStatusColor = (status: Table["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-200 hover:bg-green-300";
      case "occupied":
        return "bg-red-200 hover:bg-red-300";
      case "reserved":
        return "bg-yellow-200 hover:bg-yellow-300";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Restaurant Floor Plan</h1>
        <div className="space-x-4">
          <Link
            href="/restaurants"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Manage Restaurants
          </Link>
          <Link
            href="/owners"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Manage Owners
          </Link>
        </div>
      </div>

      {/* Table Status Legend */}
      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span>Reserved</span>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {tables.map((table) => (
          <Link
            key={table.id}
            href={`/tables/${table.id}`}
            className={`
              ${getStatusColor(table.status)}
              p-4 rounded-lg shadow-md cursor-pointer
              transition-colors duration-200
              flex flex-col items-center justify-center
              aspect-square
            `}
          >
            <span className="font-bold text-lg">{table.tableNumber}</span>
            <span className="text-sm">{table.capacity} seats</span>
            <span className="text-xs capitalize mt-1">{table.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
