/** Unlock a table via API (avoids aborted server-action cleanups in production). */
export async function unlockTableRequest(tableId: number): Promise<boolean> {
  try {
    const response = await fetch(`/api/tables/${tableId}/lock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locked: false }),
      keepalive: true,
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to unlock table:", error);
    return false;
  }
}
