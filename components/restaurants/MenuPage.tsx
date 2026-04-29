"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getMenuItems,
} from "@/actions/menu";
import { MenuItems, Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AddMenuItemModal } from "./AddMenuItemModal";
import { UpdateMenuItemModal } from "./UpdateMenuItemModal";
import { Pencil, Trash, Plus } from "lucide-react";
import { AddCategoryModal } from "./AddCategoryModal";
import { UpdateCategoryModal } from "./UpdateCategoryModal";

interface MenuPageProps {
  restaurantId: number;
}

interface MenuItemWithCategory extends MenuItems {
  category: Category;
}

interface NewMenuItem {
  name: string;
  description?: string;
  price: string;
  categoryId: number;
}

export default function MenuPage({ restaurantId }: MenuPageProps) {
  const [menuItems, setMenuItems] = useState<MenuItemWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isUpdateCategoryModalOpen, setIsUpdateCategoryModalOpen] =
    useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemWithCategory | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [newMenuItem, setNewMenuItem] = useState<NewMenuItem>({
    name: "",
    description: "",
    price: "",
    categoryId: 0,
  });

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      const [categoriesData, menuItemsData] = await Promise.all([
        getCategories(restaurantId),
        getMenuItems(restaurantId),
      ]);
      setCategories(categoriesData);
      setMenuItems(menuItemsData as MenuItemWithCategory[]);
    } catch (error) {
      console.error("Failed to load menu:", error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleAddMenuItem = async (item: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    hasSpicyOption: boolean;
    hasSidesOption: boolean;
  }) => {
    setIsPending(true);
    try {
      await createMenuItem(restaurantId, item);
      await loadMenu();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to add menu item:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUpdateItem = (
    id: number,
    item: {
      name: string;
      description?: string;
      price: number;
      categoryId: number;
    },
  ) => {
    setIsPending(true);
    startTransition(() => {
      updateMenuItem(id, item)
        .then(() => {
          loadMenu();
          setIsUpdateModalOpen(false);
          setSelectedItem(null);
          setIsPending(false);
        })
        .catch((error) => {
          console.error("Failed to update item:", error);
          setIsPending(false);
        });
    });
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setIsPending(true);
      startTransition(() => {
        deleteMenuItem(id)
          .then(() => {
            loadMenu();
            setIsPending(false);
          })
          .catch((error) => {
            console.error("Failed to delete item:", error);
            setIsPending(false);
          });
      });
    }
  };

  const handleAddCategory = (category: {
    name: string;
    description?: string;
    restaurantId: number;
  }) => {
    setIsPending(true);
    startTransition(() => {
      createCategory(category)
        .then(() => {
          loadMenu();
          setIsAddCategoryModalOpen(false);
          setIsPending(false);
        })
        .catch((error) => {
          console.error("Failed to add category:", error);
          setIsPending(false);
        });
    });
  };

  const handleUpdateCategory = (
    id: number,
    category: {
      name: string;
      description?: string;
      restaurantId: number;
    },
  ) => {
    setIsPending(true);
    startTransition(() => {
      updateCategory(id, {
        name: category.name,
        description: category.description,
      })
        .then(() => {
          loadMenu();
          setIsUpdateCategoryModalOpen(false);
          setSelectedCategory(null);
          setIsPending(false);
        })
        .catch((error) => {
          console.error("Failed to update category:", error);
          setIsPending(false);
        });
    });
  };

  const handleDeleteCategory = (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All items in this category will be moved to uncategorized.",
      )
    ) {
      setIsPending(true);
      startTransition(() => {
        deleteCategory(id)
          .then(() => {
            loadMenu();
            setIsPending(false);
          })
          .catch((error) => {
            console.error("Failed to delete category:", error);
            setIsPending(false);
          });
      });
    }
  };

  if (loading) {
    return <div className="text-black">Loading menu...</div>;
  }

  // Group items by category
  const itemsByCategory = menuItems.reduce(
    (acc, item) => {
      const categoryId = item.categoryId;
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(item);
      return acc;
    },
    {} as Record<number, MenuItemWithCategory[]>,
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto p-4 text-black">
      <div className="mb-6 flex shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Menu</h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 pr-1">
        <div className="grid grid-cols-1 gap-6 pb-4 md:grid-cols-2">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-white text-black">
                <div>
                  <h3 className="text-xl font-semibold text-black">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-black">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:text-black"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsUpdateCategoryModalOpen(true);
                    }}
                    disabled={isPending}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:text-black"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={isPending}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-black hover:text-black"
                    onClick={() => {
                      setNewMenuItem((prev) => ({
                        ...prev,
                        categoryId: category.id,
                      }));
                      setIsAddModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="bg-white text-black">
                <div className="space-y-4">
                  {itemsByCategory[category.id]?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="sm:flex sm:items-start sm:justify-between sm:gap-4">
                          <div>
                            <h4 className="font-medium text-black">
                              {item.name}
                            </h4>
                            <div className="font-medium text-black tabular-nums sm:hidden">
                              ${item.price.toFixed(2)}
                            </div>
                            {item.description && (
                              <p className="text-sm text-black">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="hidden font-medium text-black tabular-nums sm:block">
                            ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-black hover:text-black"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsUpdateModalOpen(true);
                          }}
                          disabled={isPending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-black hover:text-black"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isPending}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-3 flex shrink-0 justify-end">
        <div className="group relative">
          <Button
            size="icon"
            onClick={() => setIsAddCategoryModalOpen(true)}
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="pointer-events-none absolute right-0 top-[-2rem] hidden whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white group-hover:block">
            Add Category
          </span>
        </div>
      </div>

      {/* Add Menu Item Modal */}
      {isAddModalOpen && (
        <AddMenuItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMenuItem}
          categories={categories}
          initialCategoryId={newMenuItem.categoryId}
        />
      )}

      {selectedItem && (
        <UpdateMenuItemModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdateItem}
          item={selectedItem}
          categories={categories}
        />
      )}

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSubmit={handleAddCategory}
        restaurantId={restaurantId}
      />

      {selectedCategory && (
        <UpdateCategoryModal
          isOpen={isUpdateCategoryModalOpen}
          onClose={() => {
            setIsUpdateCategoryModalOpen(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleUpdateCategory}
          category={selectedCategory}
        />
      )}
    </div>
  );
}
