"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getEmployees } from "@/app/(protected)/restaurants/[restaurantId]/actions";
import { deleteEmployee } from "@/actions/employee";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import NewEmployeeModal from "./NewEmployeeModal";
import UpdateEmployeeModal from "./UpdateEmployeeModal";

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pin: string;
  salary: number | null;
  roleId: number;
  restaurantId: number;
  role: {
    name: string;
  };
}

export default function EmployeesPage() {
  const params = useParams();
  const restaurantId = parseInt(params.restaurantId as string);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [updateEmployeeModalOpen, setUpdateEmployeeModalOpen] = useState(false);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees(restaurantId);
      // Sort employees by ID to maintain consistent order
      const sortedEmployees = data.sort((a, b) => a.id - b.id);
      setEmployees(sortedEmployees);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [restaurantId]);

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setUpdateEmployeeModalOpen(true);
  };

  const handleDelete = async (employeeId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    ) {
      try {
        const result = await deleteEmployee(employeeId);
        if (result.success) {
          loadEmployees(); // Refresh the list
        } else {
          console.error(result.error);
        }
      } catch (error) {
        console.error("Failed to delete employee:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      <NewEmployeeModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSuccess={loadEmployees}
      />
      <UpdateEmployeeModal
        isOpen={updateEmployeeModalOpen}
        setIsOpen={setUpdateEmployeeModalOpen}
        selectedEmployee={selectedEmployee}
        onSuccess={loadEmployees}
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
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                {employee.firstName} {employee.lastName}
              </TableCell>
              <TableCell className="capitalize">{employee.role.name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.phone}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => handleEditClick(employee)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(employee.id)}
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
