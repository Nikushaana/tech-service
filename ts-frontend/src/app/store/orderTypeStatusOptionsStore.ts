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

        // off site
        { id: "pickup_started", name: "კურიერი გზაშია" },
        { id: "picked_up", name: "ტექნიკა ჩატვირთულია" },
        { id: "to_technician", name: "მიდის ტექნიკოსთან" },
        { id: "delivered_to_technician", name: "ტექნიკოსის ხელშია" },
        { id: "inspection", name: "დიაგნოსტიკა" },
        { id: "waiting_decision", name: "გადაწყვეტილების მოლოდინში" },
        // approve
        { id: "repairing_off_site", name: "სერვისი მიმდინარეობს სერვისცენტრში" },
        { id: "fixed_ready", name: "შეკეთებულია" },
        { id: "returning_fixed", name: "შეკეთებული ტექნიკა ბრუნდება" },
        { id: "returned_fixed", name: "შეკეთებული ტექნიკა დაბრუნდა" },
        { id: "completed", name: "დასრულდა" },
        // cancel
        { id: "repair_cancelled", name: "სერვისი გაუქმდა" },
        { id: "broken_ready", name: "დაზიანებული ტექნიკა მზად არის დაბრუნებისთვის" },
        { id: "returning_broken", name: "დაზიანებული ტექნიკა ბრუნდება" },
        { id: "returned_broken", name: "დაზიანებული ტექნიკა დაბრუნდა" },
        { id: "cancelled", name: "გაუქმდა" },

        // on site
        { id: "technician_coming", name: "ტექნიკოსი გზაშია" },
        { id: "installing", name: "მიმდინარეობს ინსტალაცია" },
        { id: "repairing_on_site", name: "შეკეთება მიმდინარეობს ადგილზე" },
        { id: "waiting_payment", name: "ანგარიშსწორების მოლოდინში" },
        { id: "completed_on_site_installing", name: "ინსტალაცია დასრულდა" },
        { id: "completed_on_site_repairing", name: "ადგილზე შეკეთება დასრულდა" },
    ],
}));