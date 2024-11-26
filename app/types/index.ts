export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  orders?: Order[];
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: "appetizer" | "main" | "dessert" | "beverage";
  description: string;
}

export interface Order {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  status: "pending" | "preparing" | "served" | "paid";
}
