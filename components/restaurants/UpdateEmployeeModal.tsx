"use client ";

import React, { startTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Employee } from "@/components/restaurants/EmployeesPage";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { Input } from "../ui/input";

import { FormError } from "@/components/form-error";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateEmployeeSchema } from "@/schemas";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { updateEmployee } from "@/actions/employee";

const UpdateEmployeeModal = ({
  isOpen,
  setIsOpen,
  selectedEmployee,
  onSuccess,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEmployee: Employee | null;
  onSuccess: () => void;
}) => {
  const form = useForm<z.infer<typeof UpdateEmployeeSchema>>({
    resolver: zodResolver(UpdateEmployeeSchema),
    values: {
      firstName: selectedEmployee?.firstName || "",
      lastName: selectedEmployee?.lastName || "",
      email: selectedEmployee?.email || "",
      phone: selectedEmployee?.phone || "",
      restaurantId: 2,
      role: selectedEmployee?.role.name as
        | "waiter"
        | "manager"
        | "cooker"
        | "delivery_driver"
        | "chef",
    },
  });

  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  if (!selectedEmployee) {
    return null;
  }
  const onSubmit = async (values: z.infer<typeof UpdateEmployeeSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);
    startTransition(() => {
      updateEmployee({ ...values, id: selectedEmployee.id }).then((data) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) {
          onSuccess();
          setIsOpen(false);
        }
        setIsPending(false);
        setSuccess("");
      });
    });
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="overflow-visible z-50">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={selectedEmployee?.firstName}
                            //disabled={isPending}//
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={selectedEmployee?.lastName || ""}
                            //disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            value={selectedEmployee?.email || ""}
                            //disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={selectedEmployee?.phone || ""}
                            type="tel"
                            //disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full flex justify-between items-center"
                            >
                              {field.value
                                ? field.value.charAt(0).toUpperCase() +
                                  field.value.slice(1).replace("_", " ")
                                : "Select a role"}
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-56 z-50"
                            align="start"
                            side="bottom"
                            sideOffset={-8}
                          >
                            <DropdownMenuItem
                              onClick={() => field.onChange("waiter")}
                            >
                              Waiter
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => field.onChange("manager")}
                            >
                              Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => field.onChange("cooker")}
                            >
                              Cooker
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => field.onChange("delivery_driver")}
                            >
                              Delivery Driver
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => field.onChange("chef")}
                            >
                              Chef
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <div className="flex items-center gap-x-2">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateEmployeeModal;
