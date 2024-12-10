import { getRestaurant } from "../actions";

export default async function RestaurantPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const restaurant = await getRestaurant(parseInt(params.restaurantId));

  if (!restaurant) {
    return <div>Restaurant not found</div>;
  }
  console.log(restaurant);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">{restaurant.name}</h1>
      {/* Display restaurant details, tables, etc. */}
    </div>
  );
}
