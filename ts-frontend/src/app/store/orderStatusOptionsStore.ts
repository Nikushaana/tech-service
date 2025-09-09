import { create } from "zustand";

interface OrderStatusOptionsState {
    statusOptions: { id: string; name: string }[];
}

export const useOrderStatusOptionsStore = create<OrderStatusOptionsState>((set) => ({
    statusOptions: [
        { id: "pending", name: "დადასტურების მოლოდინში" },
        { id: "pickup_in_progress", name: "დელივერი მოემართება" },
        { id: "inspection", name: "მიმდინარეობს ინსპექტირება" },
        { id: "waiting_customer_approval", name: "თქვენი დასტურის მოლოდინში" },
        { id: "repair_in_progress", name: "მიმდინარეობს შეკეთება" },
        { id: "returning", name: "ტექნიკა ბრუნდება" },
        { id: "completed", name: "დასრულებული" },
        { id: "cancelled", name: "გაუქმებული" },
    ],
}));