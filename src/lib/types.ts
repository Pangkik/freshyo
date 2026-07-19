export type Profile = {
  id: string;
  display_name: string | null;
};

export type Store = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  photo_url: string | null;
  store_type: string;
  created_at: string;
};

export type Item = {
  id: string;
  name: string;
  name_hil: string | null;
  brand: string | null;
  size_label: string | null;
  category: string;
  unit: string;
  image_url: string | null;
  created_at: string | null;
};

export type PriceReport = {
  id: string;
  item_id: string;
  store_id: string;
  price: number;
  unit: string;
  note: string | null;
  reported_by: string | null;
  created_at: string;
};

export type Rating = {
  id: string;
  store_id: string;
  user_id: string;
  ambience: number;
  accessibility: number;
  ease_of_access: number;
  cleanliness: number;
  location: number;
  created_at: string;
};
