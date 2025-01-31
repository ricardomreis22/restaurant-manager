"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getRestaurantStaff,
  deleteStaffMember,
  updateStaffMember,
  addStaffMember,
} from "@/app/(protected)/restaurants/actions";
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Members</h1>
        <Button onClick={() => setIsOpen(true)}>Add Staff Member</Button>
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
          {staff.map((staffMember) => (
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
    </div>
  );
}
