"use client";

import React, { startTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StaffMember } from "@/components/restaurants/StaffPage";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateStaffSchema } from "@/schemas";
import { z } from "zod";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { updateStaffMember } from "@/app/(protected)/restaurants/actions";

interface UpdateStaffModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEmployee: StaffMember | null;
  onSuccess: () => void;
}

const UpdateStaffModal = ({
  isOpen,
  setIsOpen,
  selectedEmployee,
  onSuccess,
}: UpdateStaffModalProps) => {
  const form = useForm<z.infer<typeof UpdateStaffSchema>>({
    resolver: zodResolver(UpdateStaffSchema),
    values: {
      name: selectedEmployee?.name || "",
      email: selectedEmployee?.email || "",
      phone: selectedEmployee?.phone || "",
      restaurantId: selectedEmployee?.restaurantId || 0,
      role: selectedEmployee?.role?.name as
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

  const onSubmit = async (values: z.infer<typeof UpdateStaffSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);
    startTransition(() => {
      updateStaffMember(selectedEmployee.id, values).then((data) => {
        setError(data.error);
        setSuccess(data.success);
        if (data.success) {
          onSuccess();
          setIsOpen(false);
        }
        setIsPending(false);
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="overflow-visible z-50">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
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
                        <DropdownMenuContent align="end">
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
  );
};

export default UpdateStaffModal;
