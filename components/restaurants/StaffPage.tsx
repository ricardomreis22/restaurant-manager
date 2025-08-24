"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRestaurantStaff, deleteStaffMember } from "@/actions/staff";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NewStaffModal from "./NewStaffModal";
import UpdateStaffModal from "./UpdateStaffModal";
import { UserRole } from "@prisma/client";
import { ArrowLeft, Plus } from "lucide-react";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  userRole: UserRole;
  restaurantId: number;
  role: {
    id: number;
    name: string;
  } | null;
}

export default function StaffPage() {
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  const loadStaff = async () => {
    try {
      const data = await getRestaurantStaff(restaurantId);
      const mappedStaff = data.map((staff: any) => ({
        ...staff,
        restaurantId,
      }));
      setStaff(mappedStaff);
    } catch (error) {
      console.error("Failed to load staff:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [restaurantId]);

  const handleEditClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setUpdateModalOpen(true);
  };

  const handleDelete = async (staffId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this staff member? This action cannot be undone."
      )
    ) {
      try {
        const result = await deleteStaffMember(staffId);
        if (result.success) {
          loadStaff();
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error("Failed to delete staff member:", error);
      }
    }
  };

  const getFilteredStaff = () => {
    switch (activeTab) {
      case "managers":
        return staff.filter((member) =>
          member.role?.name?.toLowerCase().includes("manager")
        );
      case "waiters":
        return staff.filter((member) =>
          member.role?.name?.toLowerCase().includes("waiter")
        );
      case "kitchen":
        return staff.filter(
          (member) =>
            member.role?.name?.toLowerCase().includes("kitchen") ||
            member.role?.name?.toLowerCase().includes("chef") ||
            member.role?.name?.toLowerCase().includes("cook")
        );
      case "admin":
        return staff.filter((member) => member.userRole === "ADMIN");
      default:
        return staff;
    }
  };

  const tabs = [
    { id: "all", label: "All Staff" },
    { id: "managers", label: "Managers" },
    { id: "waiters", label: "Waiters" },
    { id: "kitchen", label: "Kitchen" },
    { id: "admin", label: "Admin" },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const filteredStaff = getFilteredStaff();

  return (
    <div className="p-6">
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-t-lg ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <NewStaffModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSuccess={loadStaff}
        restaurantId={restaurantId}
      />
      <UpdateStaffModal
        isOpen={updateModalOpen}
        setIsOpen={setUpdateModalOpen}
        selectedEmployee={selectedStaff}
        onSuccess={loadStaff}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStaff.map((staffMember) => (
            <TableRow key={staffMember.id}>
              <TableCell>{staffMember.name}</TableCell>
              <TableCell className="capitalize">
                {staffMember.role?.name || "No Role"}
              </TableCell>
              <TableCell>{staffMember.email}</TableCell>
              <TableCell>{staffMember.phone || "N/A"}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditClick(staffMember)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(staffMember.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 ">
        <Button
          onClick={() => setIsOpen(true)}
          className="transform transition-transform duration-200 hover:scale-110 shadow-lg"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden ml-2 sm:inline">Add Staff Member</span>
        </Button>
      </div>
    </div>
  );
}
