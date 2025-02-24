"use client";

import { useParams, useRouter } from "next/navigation";
import { TableView } from "@/components/restaurants/TableView";
import { useEffect, useState } from "react";
import { getTables } from "@/actions/tables";

interface Table {
  id: number;
  number: number;
  capacity: number;
  isReserved: boolean;
}

export default function TablePage() {
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const tableId = parseInt(params.tableId as string);
  const [table, setTable] = useState<Table | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadTable = async () => {
      try {
        const response = await getTables(restaurantId);
        if (response.success) {
          const foundTable = response.tables.find((t) => t.id === tableId);
          if (foundTable) {
            setTable(foundTable);
          }
        }
      } catch (error) {
        console.error("Failed to load table:", error);
      }
    };

    loadTable();
  }, [restaurantId, tableId]);

  if (!table) {
    return <div>Loading...</div>;
  }

  return (
    <TableView
      table={table}
      restaurantId={restaurantId}
      onClose={() => router.push(`/restaurants/${restaurantId}`)}
    />
  );
}
