"use client";

import { useParams, useRouter } from "next/navigation";
import { TableView } from "@/components/restaurants/TableView";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function TablePage() {
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const tableId = parseInt(params.tableId as string);
  const router = useRouter();

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl);
    socket.emit("join-table", restaurantId);

    return () => {
      socket.disconnect();
    };
  }, [restaurantId]);

  return (
    <TableView
      tableId={tableId}
      restaurantId={restaurantId}
      onClose={() => router.push(`/restaurants/${restaurantId}`)}
    />
  );
}
