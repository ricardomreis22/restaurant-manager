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
import { Category } from "@prisma/client";

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    hasSpicyOption: boolean;
    hasSidesOption: boolean;
  }) => void;
  categories: Category[];
  initialCategoryId?: number;
}

export function AddMenuItemModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialCategoryId,
}: AddMenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: initialCategoryId?.toString() || "",
    hasSpicyOption: false,
    hasSidesOption: false,
  });

  useEffect(() => {
    if (initialCategoryId) {
      setFormData((prev) => ({
        ...prev,
        categoryId: initialCategoryId.toString(),
      }));
    }
  }, [initialCategoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      categoryId: parseInt(formData.categoryId),
    });
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      hasSpicyOption: false,
      hasSidesOption: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
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
                  <SelectValue placeholder="Select a category" />
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
            <Button type="submit" variant="modal">
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
