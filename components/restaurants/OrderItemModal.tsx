import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MenuItems, Category } from "@prisma/client";

interface MenuItemWithCategory extends MenuItems {
  category: Category;
}

interface OrderItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: {
    menuItem: MenuItemWithCategory;
    quantity: number;
    notes: string;
    spicyLevel?: string;
    sides?: string;
  }) => void;
  item: MenuItemWithCategory;
}

export function OrderItemModal({
  isOpen,
  onClose,
  onSubmit,
  item,
}: OrderItemModalProps) {
  const [formData, setFormData] = useState({
    quantity: 1,
    notes: "",
    spicyLevel: "",
    sides: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      menuItem: item,
      ...formData,
    });
    setFormData({
      quantity: 1,
      notes: "",
      spicyLevel: "",
      sides: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {item.name} to Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1),
                    }))
                  }
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  className="w-20 text-center"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: prev.quantity + 1,
                    }))
                  }
                >
                  +
                </Button>
              </div>
            </div>

            {item.hasSpicyOption && (
              <div>
                <Label htmlFor="spicyLevel">Spicy Level</Label>
                <Select
                  value={formData.spicyLevel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, spicyLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spicy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="extraHot">Extra Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {item.hasSidesOption && (
              <div>
                <Label htmlFor="sides">Sides</Label>
                <Input
                  id="sides"
                  value={formData.sides}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sides: e.target.value }))
                  }
                  placeholder="Enter sides (e.g., rice, salad)"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Special instructions or notes"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="modal">
              Add to Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
