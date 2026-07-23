/** Unlock a table via API (avoids aborted server-action cleanups in production). */
export async function unlockTableRequest(
  tableId: number,
  options?: { keepalive?: boolean },
): Promise<boolean> {
  try {
    const response = await fetch(`/api/tables/${tableId}/lock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locked: false }),
      keepalive: options?.keepalive ?? false,
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(
        `Failed to unlock table ${tableId}: ${response.status} ${details}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to unlock table:", error);
    return false;
  }
}
