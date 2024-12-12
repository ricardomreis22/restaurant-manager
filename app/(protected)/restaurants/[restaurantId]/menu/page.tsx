"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { getRestaurantMenu } from "../actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus } from "lucide-react";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .transform((val) => parseFloat(val)),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

export default function MenuSetupPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = use(params);
  const [menuItems, setMenuItems] = useState<MenuItemFormValues[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
  });

  const onSubmit = async (values: MenuItemFormValues) => {
    try {
      // TODO: Add API call to save menu item
      console.log(values);
      setMenuItems([...menuItems, values]);
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create menu item:", error);
    }
  };

  const handleAddCategory = () => {
    // TODO: Implement category creation
    console.log("Add category");
    setIsAddingCategory(false);
  };

  return (
    <div className="p-8">
      <Button onClick={() => handleAddCategory()}>Add Category</Button>
    </div>
  );
}
