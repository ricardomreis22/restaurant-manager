"use client";

import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewStaffSchema } from "@/schemas";
import type { z } from "zod";
import { ChevronDown } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FormError } from "@/components/form-error";
import { createStaffMember } from "@/actions/staff";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface NewStaffModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
  restaurantId: number;
}

const NewStaffModal = ({
  isOpen,
  setIsOpen,
  onSuccess,
  restaurantId,
}: NewStaffModalProps) => {
  const [error, setError] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof NewStaffSchema>>({
    resolver: zodResolver(NewStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "waiter",
      restaurantId,
    },
  });

  const onSubmit = async (values: z.infer<typeof NewStaffSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);
    startTransition(() => {
      createStaffMember(values).then(
        (data: { error?: string; success?: string }) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            setSuccess(data.success);
            form.reset();
            onSuccess();
            setIsOpen(false);
          }
          setIsPending(false);
        }
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
              <FormField
                control={form.control}
                name="restaurantId"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" value={restaurantId} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormError message={error} />
              <div className="flex gap-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Staff Member"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewStaffModal;
