"use client";

import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RestaurantSchema } from "@/schemas/index";
import { createRestaurant } from "@/actions/restaurants";
import { useRouter } from "next/navigation";
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
import { FormSuccess } from "@/components/form-success";
import { Phone, Mail, MapPin } from "lucide-react";
import type { z } from "zod";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof RestaurantSchema>>({
    resolver: zodResolver(RestaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RestaurantSchema>) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    startTransition(() => {
      createRestaurant(values).then(
        (data: {
          error?: string;
          success?: boolean;
          restaurant?: any;
        }) => {
          if (data?.error) {
            setError(data.error);
            setIsPending(false);
          } else if (data?.success || data?.restaurant) {
            setSuccess("Restaurant created successfully!");
            form.reset();
            router.push("/restaurants");
          } else {
            setIsPending(false);
          }
        }
      );
    });
  };

  return (
    <div className="p-8 w-full text-white mt-20">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
        {/* Left side - Form */}
        <div className="flex-1 pl-8 lg:pl-32 pr-8 lg:pr-8">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Create New Restaurant
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
              <div className="space-y-4 mr-40">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Restaurant Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="Enter restaurant name"
                          className="bg-white text-gray-900"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter address"
                            className="bg-white text-gray-900 pl-10"
                          />
                        </div>
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
                      <FormLabel className="text-white">
                        Phone (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter phone number"
                            className="bg-white text-gray-900 pl-10"
                          />
                        </div>
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
                      <FormLabel className="text-white">
                        Email (Optional)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            disabled={isPending}
                            placeholder="Enter email"
                            type="email"
                            className="bg-white text-gray-900 pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormError message={error} />
              <FormSuccess message={success} />

              <div className="flex gap-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Restaurant"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/restaurants")}
                  className="border-white text-gray-900 hover:bg-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Middle Separator Bar */}
        <div
          className="hidden lg:flex w-[2px] mx-8 my-8 rounded-full"
          style={{ backgroundColor: "rgb(164,169,132)" }}
        />

        {/* Right side - Title */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold">
              Welcome to Restaurant Manager
            </h2>
            {/* You can add more content here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
}
