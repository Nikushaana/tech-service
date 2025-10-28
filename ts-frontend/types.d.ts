interface CategoryData {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Faq {
  id: number;
  question: string;
  answer: string;
  status: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

interface Category {
  id: number;
  name: string;
  images: string[] | [];
  status: boolean;
  created_at: string;
  updated_at: string;
};

interface Address {
  id: number;
  name: string;
  apartment_number: string;
  building_entrance: string;
  building_floor: string;
  building_number: string;
  city: string;
  description: string;
  location: LatLng;
  street: string;
  created_at: string;
  updated_at: string;
};

interface Branch {
  id: number;
  name: string;
  city: string;
  street: string;
  building_number: string;
  description: string;
  coverage_radius_km: string;
  delivery_price: string;
  location: LatLng;
  created_at: string;
  updated_at: string;
};

interface User {
  id: number;
  // individual
  name?: string;
  lastName?: string;
  // company
  companyAgentLastName?: string;
  companyAgentName?: string;
  companyIdentificationCode?: string;
  companyName?: string;
  // technician
  phone: string;
  role: string;
  images: string[] | [];
  status: boolean;
  created_at: string;
  updated_at: string;
};

interface Order {
  id: number;
  address: Address;
  brand: string;
  model: string;
  status: string;
  images: string[];
  videos: string[];
  category: Category;
  company: User | null;
  individual: User | null;
  technician: User | null;
  description: string;
  created_at: string;
  updated_at: string;
};

interface Review {
  id: number;
  review: string;
  stars: number;
  status: boolean;
  company?: User | null;
  individual?: User | null;
  created_at: string;
  updated_at: string;
};

interface LatLng {
  lat: number;
  lng: number;
}