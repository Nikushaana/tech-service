interface Category {
  id: number;
  name: string;
  images: string[];
  status: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoryData {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Faq {
  id: number;
  answer: string;
  question: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

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
  status: boolean;
};