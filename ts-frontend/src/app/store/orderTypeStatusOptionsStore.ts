import { create } from "zustand";

interface Option {
    id: string;
    name: string;
}

interface OrderTypeStatusOptionsState {
    typeOptions: Option[];
    statusOptions: Option[];
}

export const useOrderTypeStatusOptionsStore = create<OrderTypeStatusOptionsState>((set) => ({
    typeOptions: [
        { id: "installation", name: "მონტაჟი" },
        { id: "fix_off_site", name: "შეკეთება სერვისცენტრში" },
        { id: "fix_on_site", name: "შეკეთება ადგილზე" },
    ],
    statusOptions: [
        { id: "pending", name: "მიღებულია" },
        { id: "assigned", name: "გადაცემულია" },
        { id: "pickup_started", name: "კურიერი გზაშია" },

        { id: "technician_coming", name: "ტექნიკოსი გზაშია" },

        { id: "picked_up", name: "აღებულია" },
        { id: "to_technician", name: "ტექნიკოსთან მიდის" },
        { id: "delivered_to_technician", name: "ტექნიკოსთან მიწოდებულია" },
        { id: "inspection", name: "დიაგნოსტიკა" },
        { id: "waiting_payment", name: "ანგარიშსწორების მოლოდინი" },

        { id: "repairing", name: "მიმდინარეობს შეკეთება" },
        { id: "installing", name: "მიმდინარეობს ინსტალაცია" },

        { id: "fixed_ready", name: "მზად არის" },
        { id: "returning_fixed", name: "ბრუნდება" },
        { id: "returned_fixed", name: "მიწოდებულია" },
        { id: "completed", name: "დასრულდა" },
        { id: "completed_on_site", name: "დასრულდა გამოძახებით" },

        { id: "repair_cancelled", name: "სერვისი გაუქმდა" },
        { id: "broken_ready", name: "მზად არის დაბრუნებისთვის" },
        { id: "returning_broken", name: "ბრუნდება" },
        { id: "returned_broken", name: "დაბრუნებულია" },
        { id: "cancelled", name: "გაუქმებულია" },
    ],
}));