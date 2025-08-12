"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, DollarSign, Calendar, X } from "lucide-react";

interface ActivityLog {
  id: number;
  sessionId: number;
  userId: number;
  activityType: string;
  description: string;
  metadata: any;
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

export default function ActivityLogPage({
  restaurantId,
  isAdminView = false,
  setDisplay,
  adminSetDisplay,
}: ActivityLogPageProps) {
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<TableSession | null>(
    null
  );

  useEffect(() => {
    const loadActivityLog = async () => {
      try {
        const response = await fetch(
          `/api/restaurants/${restaurantId}/activity-log`
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
    return <div className="p-6">Loading activity log...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {selectedSession ? (
        // Single session view
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">
                  Table {selectedSession.table.number} Session
                </h3>
                <p className="text-gray-600">
                  {formatDate(selectedSession.openedAt)} -
                  {selectedSession.closedAt
                    ? formatDate(selectedSession.closedAt)
                    : "Active"}
                </p>
              </div>
              <div className="flex items-center border-2 border-gray-800  p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedSession(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="font-medium">
                  {formatDuration(selectedSession.duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Guests:</span>
                <span className="font-medium">
                  {selectedSession.numberOfGuests}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Total:</span>
                <span className="font-medium">
                  ${selectedSession.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold">Activities</h4>
              {selectedSession.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getActivityTypeColor(
                      activity.activityType
                    )}`}
                  >
                    {activity.activityType.replace("_", " ")}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      by {activity.user.name} at{" "}
                      {formatDate(activity.timestamp)}
                    </p>
                    {activity.metadata && (
                      <div className="mt-2 text-sm text-gray-500">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        // All sessions view
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              No activity found for this restaurant.
            </Card>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">
                      Table {session.table.number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(session.openedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(session.duration)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {session.numberOfGuests}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />$
                      {session.totalAmount.toFixed(2)}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                        session.closedAt
                          ? "border-transparent bg-secondary text-secondary-foreground"
                          : "border-transparent bg-primary text-primary-foreground"
                      }`}
                    >
                      {session.closedAt ? "Closed" : "Active"}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {session.activities.length} activities
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
