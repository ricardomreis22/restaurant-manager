/** Table lock via API (avoids aborted/throwing server actions in production). */

export async function setTableLockRequest(
  tableId: number,
  locked: boolean,
  options?: { keepalive?: boolean },
): Promise<boolean> {
  try {
    const response = await fetch(`/api/tables/${tableId}/lock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locked }),
      keepalive: options?.keepalive ?? false,
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(
        `Failed to ${locked ? "lock" : "unlock"} table ${tableId}: ${response.status} ${details}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Failed to ${locked ? "lock" : "unlock"} table:`, error);
    return false;
  }
}

export async function unlockTableRequest(
  tableId: number,
  options?: { keepalive?: boolean },
): Promise<boolean> {
  return setTableLockRequest(tableId, false, options);
}

export async function checkTableLockRequest(tableId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/tables/${tableId}/lock`, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `Failed to check table lock ${tableId}: ${response.status}`,
      );
      return true;
    }

    const data = (await response.json()) as { isLocked?: boolean };
    return Boolean(data?.isLocked);
  } catch (error) {
    console.error("Failed to check table lock:", error);
    return true;
  }
}
