"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** `md` and up (≥768px): 10 per page; below `md`: 8 per page. */
const ACTIVITIES_PER_PAGE_MD_UP = 10;
const ACTIVITIES_PER_PAGE_BELOW_MD = 8;

type SortColumn = "table" | "date" | "user" | "price" | "event";

type SortState = { column: SortColumn; dir: "asc" | "desc" };

const defaultSort: SortState = { column: "date", dir: "desc" };

interface ActivityLog {
  id: number;
  sessionId: number;
  userId: number;
  activityType: string;
  description: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
  user: {
    name: string;
  };
}

interface TableSession {
  id: number;
  tableId: number;
  openedAt: Date;
  closedAt: Date | null;
  totalAmount: number;
  numberOfGuests: number;
  duration: number | null;
  notes: string | null;
  activities: ActivityLog[];
  table: {
    number: number;
  };
}

interface ActivityLogPageProps {
  restaurantId: number;
  isAdminView?: boolean;
  setDisplay?: (display: string) => void;
  adminSetDisplay?: (display: string) => void;
}

type FlatActivity = ActivityLog & {
  tableNumber: number;
  sessionId: number;
};

type SortableActivity = ActivityLog & { tableNumber: number };

function parsePriceNumber(
  metadata: Record<string, unknown> | null | undefined,
): number | null {
  if (!metadata || typeof metadata !== "object") return null;
  const raw = metadata.totalAmount;
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? parseFloat(raw)
        : NaN;
  if (typeof n === "number" && !Number.isNaN(n)) return n;
  return null;
}

function compareSortableRows(
  a: SortableActivity,
  b: SortableActivity,
  col: SortColumn,
  dir: "asc" | "desc",
): number {
  const m = dir === "asc" ? 1 : -1;
  let cmp = 0;
  switch (col) {
    case "table":
      cmp = a.tableNumber - b.tableNumber;
      if (cmp === 0) cmp = a.id - b.id;
      break;
    case "date":
      cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      if (cmp === 0) cmp = a.id - b.id;
      break;
    case "user":
      cmp = a.user.name.localeCompare(b.user.name, undefined, {
        sensitivity: "base",
      });
      if (cmp === 0) cmp = a.id - b.id;
      break;
    case "price": {
      const pa = parsePriceNumber(a.metadata);
      const pb = parsePriceNumber(b.metadata);
      if (pa == null && pb == null) cmp = 0;
      else if (pa == null) cmp = 1;
      else if (pb == null) cmp = -1;
      else cmp = pa - pb;
      break;
    }
    case "event": {
      const sa = `${a.activityType} ${a.description}`;
      const sb = `${b.activityType} ${b.description}`;
      cmp = sa.localeCompare(sb, undefined, { sensitivity: "base" });
      if (cmp === 0) cmp = a.id - b.id;
      break;
    }
  }
  return cmp * m;
}

function SortHeader({
  label,
  column,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  column: SortColumn;
  sort: SortState;
  onSort: (column: SortColumn) => void;
  align?: "left" | "right";
}) {
  const active = sort.column === column;
  const Icon = active
    ? sort.dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className={cn(
        "px-4 py-3 text-sm font-semibold text-black lg:text-base",
        align === "right" && "text-right",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1",
          align === "right" && "justify-end",
        )}
      >
        <span>{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 text-black hover:bg-muted/60"
          aria-label={`Sort by ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onSort(column);
          }}
        >
          <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
        </Button>
      </div>
    </th>
  );
}

export default function ActivityLogPage({
  restaurantId,
}: ActivityLogPageProps) {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(
    null,
  );
  const [activityPage, setActivityPage] = useState(1);
  const [activitiesPerPage, setActivitiesPerPage] = useState(
    ACTIVITIES_PER_PAGE_MD_UP,
  );
  const [listSort, setListSort] = useState<SortState>(defaultSort);
  const [detailSort, setDetailSort] = useState<SortState>(defaultSort);

  useEffect(() => {
    setActivitiesPerPage(
      window.matchMedia("(min-width: 768px)").matches
        ? ACTIVITIES_PER_PAGE_MD_UP
        : ACTIVITIES_PER_PAGE_BELOW_MD,
    );
  }, []);

  useEffect(() => {
    const loadActivityLog = async () => {
      try {
        const response = await fetch(
          `/api/restaurants/${restaurantId}/activity-log`,
        );
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions);
        }
      } catch (error) {
        console.error("Failed to load activity log:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivityLog();
  }, [restaurantId]);

  useEffect(() => {
    setActivityPage(1);
  }, [restaurantId]);

  useEffect(() => {
    setListSort(defaultSort);
    setDetailSort(defaultSort);
  }, [restaurantId]);

  useEffect(() => {
    setDetailSort(defaultSort);
  }, [selectedSession?.id]);

  const flatActivities = useMemo(() => {
    const items: FlatActivity[] = [];
    for (const session of sessions) {
      for (const activity of session.activities) {
        items.push({
          ...activity,
          tableNumber: session.table.number,
          sessionId: session.id,
        });
      }
    }
    return items;
  }, [sessions]);

  const sortedActivities = useMemo(() => {
    const arr = [...flatActivities];
    arr.sort((a, b) =>
      compareSortableRows(a, b, listSort.column, listSort.dir),
    );
    return arr;
  }, [flatActivities, listSort]);

  useEffect(() => {
    const maxPage = Math.max(
      1,
      Math.ceil(sortedActivities.length / activitiesPerPage) || 1,
    );
    setActivityPage((p) => Math.min(p, maxPage));
  }, [sortedActivities.length, activitiesPerPage]);

  useEffect(() => {
    setActivityPage(1);
  }, [listSort.column, listSort.dir]);

  const totalActivityPages = Math.max(
    1,
    Math.ceil(sortedActivities.length / activitiesPerPage) || 1,
  );

  const pagedActivities = useMemo(() => {
    const safePage = Math.min(Math.max(1, activityPage), totalActivityPages);
    const start = (safePage - 1) * activitiesPerPage;
    return sortedActivities.slice(start, start + activitiesPerPage);
  }, [
    sortedActivities,
    activityPage,
    totalActivityPages,
    activitiesPerPage,
  ]);

  const goToActivityPage = (next: number) => {
    const clamped = Math.min(
      Math.max(1, next),
      Math.max(
        1,
        Math.ceil(sortedActivities.length / activitiesPerPage) || 1,
      ),
    );
    setActivityPage(clamped);
  };

  const toggleListSort = (column: SortColumn) => {
    setListSort((prev) => ({
      column,
      dir: prev.column === column && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const toggleDetailSort = (column: SortColumn) => {
    setDetailSort((prev) => ({
      column,
      dir: prev.column === column && prev.dir === "asc" ? "desc" : "asc",
    }));
  };

  const sessionSortedRows = useMemo(() => {
    if (!selectedSession) return [];
    const enriched: SortableActivity[] = selectedSession.activities.map(
      (a) => ({
        ...a,
        tableNumber: selectedSession.table.number,
      }),
    );
    enriched.sort((a, b) =>
      compareSortableRows(a, b, detailSort.column, detailSort.dir),
    );
    return enriched;
  }, [selectedSession, detailSort]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatActivityPrice = (
    metadata: Record<string, unknown> | null | undefined,
  ) => {
    const n = parsePriceNumber(metadata);
    if (n != null) return `$${n.toFixed(2)}`;
    return "—";
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "ORDER_PLACED":
        return "bg-blue-100 text-blue-800";
      case "PAYMENT_PROCESSED":
        return "bg-green-100 text-green-800";
      case "ORDER_CANCELLED":
        return "bg-red-100 text-red-800";
      case "ORDER_MODIFIED":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center p-6 text-base text-black lg:text-lg">
        Loading activity log...
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden p-6 text-base text-black lg:text-lg">
      <div className="min-h-0 w-full flex-1 space-y-6">
        {selectedSession ? (
          // Single session view
          <div className="space-y-4 text-white">
            <Card className="border-border/80 bg-gray-600 p-6 text-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-black lg:text-2xl mb-6">
                    Table {selectedSession.table.number} Session
                  </h3>
                  <p className="text-sm text-black lg:text-base">
                    {formatDate(selectedSession.openedAt)} -
                    {selectedSession.closedAt
                      ? formatDate(selectedSession.closedAt)
                      : "Active"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 border-border hover:bg-muted/40"
                  aria-label="Back to activity list"
                  onClick={() => setSelectedSession(null)}
                >
                  <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-black" />
                  <span className="text-sm lg:text-base text-black">
                    Duration:
                  </span>
                  <span className="font-medium">
                    {formatDuration(selectedSession.duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-black lg:h-5 lg:w-5" />
                  <span className="text-sm lg:text-base text-black">
                    Guests:
                  </span>
                  <span className="font-medium">
                    {selectedSession.numberOfGuests}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-black lg:h-5 lg:w-5" />
                  <span className="text-sm  lg:text-base text-black">
                    Total:
                  </span>
                  <span className="font-medium">
                    ${selectedSession.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-0 text-lg font-semibold lg:text-xl">
                  Activities
                </h4>
                <div className="mt-3 overflow-x-auto rounded-md border border-border">
                  <table className="w-full min-w-[720px] border-collapse text-sm  lg:text-base">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <SortHeader
                          label="Table"
                          column="table"
                          sort={detailSort}
                          onSort={toggleDetailSort}
                        />
                        <SortHeader
                          label="Date"
                          column="date"
                          sort={detailSort}
                          onSort={toggleDetailSort}
                        />
                        <SortHeader
                          label="User"
                          column="user"
                          sort={detailSort}
                          onSort={toggleDetailSort}
                        />
                        <SortHeader
                          label="Price"
                          column="price"
                          sort={detailSort}
                          onSort={toggleDetailSort}
                          align="right"
                        />
                        <SortHeader
                          label="Event"
                          column="event"
                          sort={detailSort}
                          onSort={toggleDetailSort}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {sessionSortedRows.map((activity) => (
                        <tr
                          key={activity.id}
                          className="border-b border-border last:border-b-0"
                        >
                          <td className="px-4 py-3 font-medium">
                            Table {selectedSession.table.number}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            {formatDate(activity.timestamp)}
                          </td>
                          <td className="px-4 py-3">{activity.user.name}</td>
                          <td className="px-4 py-3 text-right tabular-nums">
                            {formatActivityPrice(activity.metadata)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold lg:text-sm ${getActivityTypeColor(
                                activity.activityType,
                              )}`}
                            >
                              {activity.activityType.replace(/_/g, " ")}
                            </span>
                            <p className="mt-1 max-w-md ">
                              {activity.description}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.length === 0 ? (
              <Card className="border-border/80 bg-white p-6 text-center text-base text-black shadow-sm lg:text-lg">
                No activity found for this restaurant.
              </Card>
            ) : (
              <div className="flex flex-col justify-between h-full">
                <Card className="overflow-hidden border border-border bg-white p-0 text-black shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-sm lg:text-base">
                      <thead>
                        <tr className="border-b border-border bg-muted/40">
                          <SortHeader
                            label="Table"
                            column="table"
                            sort={listSort}
                            onSort={toggleListSort}
                          />
                          <SortHeader
                            label="Date"
                            column="date"
                            sort={listSort}
                            onSort={toggleListSort}
                          />
                          <SortHeader
                            label="User"
                            column="user"
                            sort={listSort}
                            onSort={toggleListSort}
                          />
                          <SortHeader
                            label="Price"
                            column="price"
                            sort={listSort}
                            onSort={toggleListSort}
                            align="right"
                          />
                          <SortHeader
                            label="Event"
                            column="event"
                            sort={listSort}
                            onSort={toggleListSort}
                          />
                          <th
                            className="w-14 px-2 py-3 text-center text-sm font-semibold text-black lg:text-base"
                            scope="col"
                          >
                            Open
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedActivities.map((activity) => (
                          <tr
                            key={`${activity.sessionId}-${activity.id}`}
                            className="border-b border-border last:border-b-0"
                          >
                            <td className="px-4 py-3 font-medium text-black">
                              Table {activity.tableNumber}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-black">
                              {formatDate(activity.timestamp)}
                            </td>
                            <td className="px-4 py-3 text-black">
                              {activity.user.name}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-black">
                              {formatActivityPrice(activity.metadata)}
                            </td>
                            <td className="px-4 py-3 text-black">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold lg:text-sm ${getActivityTypeColor(
                                  activity.activityType,
                                )}`}
                              >
                                {activity.activityType.replace(/_/g, " ")}
                              </span>
                              <p className="mt-1 max-w-xs text-black">
                                {activity.description}
                              </p>
                            </td>
                            <td className="px-2 py-3 text-center">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-black"
                                aria-label="Open session for this activity"
                                onClick={() => {
                                  const session = sessions.find(
                                    (s) => s.id === activity.sessionId,
                                  );
                                  if (session) setSelectedSession(session);
                                }}
                              >
                                <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                {sortedActivities.length > activitiesPerPage && (
                  <div className="mt-24 mb-6 flex flex-wrap items-center justify-center gap-2 text-sm lg:text-base">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="lg:text-base"
                      disabled={activityPage <= 1}
                      onClick={() => goToActivityPage(activityPage - 1)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4 lg:h-5 lg:w-5" />
                      Previous
                    </Button>
                    <span className="px-2 text-sm text-white lg:text-base">
                      Page {activityPage} of {totalActivityPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="lg:text-base"
                      disabled={activityPage >= totalActivityPages}
                      onClick={() => goToActivityPage(activityPage + 1)}
                    >
                      Next
                      <ChevronRight className="ml-1 h-4 w-4 lg:h-5 lg:w-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
