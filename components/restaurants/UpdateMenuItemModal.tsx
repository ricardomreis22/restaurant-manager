import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MenuItems, Category } from "@prisma/client";

interface MenuItemWithCategory extends MenuItems {
  category: Category;
}

interface UpdateMenuItemModalProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    id: number,
    item: {
      name: string;
      description?: string;
      price: number;
      categoryId: number;
      hasSpicyOption: boolean;
      hasSidesOption: boolean;
    }
  ) => void;
  item: MenuItemWithCategory;
}

export function UpdateMenuItemModal({
  categories,
  isOpen,
  onClose,
  onSubmit,
  item,
}: UpdateMenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    hasSpicyOption: false,
    hasSidesOption: false,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(),
        categoryId: item.categoryId.toString(),
        hasSpicyOption: item.hasSpicyOption,
        hasSidesOption: item.hasSidesOption,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(item.id, {
      ...formData,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
      hasSpicyOption: formData.hasSpicyOption,
      hasSidesOption: formData.hasSidesOption,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Item name"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Item description"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="hasSpicyOption">Has Spicy Option</Label>
              <Switch
                id="hasSpicyOption"
                checked={formData.hasSpicyOption}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, hasSpicyOption: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="hasSidesOption">Has Sides Option</Label>
              <Switch
                id="hasSidesOption"
                checked={formData.hasSidesOption}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, hasSidesOption: checked })
                }
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
