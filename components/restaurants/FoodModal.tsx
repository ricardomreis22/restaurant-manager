import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MenuItems } from "@prisma/client";
import { Textarea } from "../../components/ui/textarea";

interface FoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { spicyLevel?: string; sides?: string }) => void;
  menuItem: MenuItems;
}

export function FoodModal({
  isOpen,
  onClose,
  onSubmit,
  menuItem,
}: FoodModalProps) {
  const [formData, setFormData] = useState({
    spicyLevel: "",
    sides: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      spicyLevel: "",
      sides: "",
      notes: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Order Options for {menuItem.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {menuItem.hasSpicyOption && (
              <div>
                <RadioGroup
                  value={formData.spicyLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, spicyLevel: value })
                  }
                  required
                >
                  <Label className="text-base font-semibold">Spicy Level</Label>
                  <div className="grid gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Very Hot" id="very-hot" />
                      <Label htmlFor="very-hot">Very Hot</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Hot" id="hot" />
                      <Label htmlFor="hot">Hot</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Mild" id="mild" />
                      <Label htmlFor="mild">Mild</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No Spicy" id="no-spicy" />
                      <Label htmlFor="no-spicy">No Spicy</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
            <p>Notes</p>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            {menuItem.hasSidesOption && (
              <div>
                <RadioGroup
                  value={formData.sides}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sides: value })
                  }
                  required
                >
                  <Label className="text-base font-semibold">Choose Side</Label>
                  <div className="grid gap-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="French Fries" id="french-fries" />
                      <Label htmlFor="french-fries">French Fries</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Salad" id="salad" />
                      <Label htmlFor="salad">Salad</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Rice" id="rice" />
                      <Label htmlFor="rice">Rice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="None" id="none" />
                      <Label htmlFor="none">No Side</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
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
