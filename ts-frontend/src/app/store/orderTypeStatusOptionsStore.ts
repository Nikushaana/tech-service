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
        { id: "fix_off_site", name: "შეკეთება სერვისცენტრში" },
        { id: "installation", name: "მონტაჟი" },
        { id: "fix_on_site", name: "შეკეთება ადგილზე" },
    ],
    statusOptions: [
        { id: "waiting_pre_payment", name: "წინასწარი ანგარიშსწორების მოლოდინში" },
        { id: "pending", name: "მუშავდება" },
        { id: "assigned", name: "გადანაწილებულია" },

        // off site
        { id: "pickup_started", name: "კურიერი გზაშია" },
        { id: "picked_up", name: "ტექნიკა ჩატვირთულია" },
        { id: "to_technician", name: "მიდის ტექნიკოსთან" },
        { id: "delivered_to_technician", name: "ტექნიკოსს გადაეცა" },
        { id: "inspection", name: "მიმდინარეობს დიაგნოსტიკა" },
        { id: "waiting_decision", name: "გადაწყვეტილების მოლოდინში" },
        // approve
        { id: "repairing_off_site", name: "შეკეთება მიმდინარეობს სერვისცენტრში" },
        { id: "fixed_ready", name: "შეკეთებულია" },
        { id: "returning_fixed", name: "შეკეთებული ტექნიკა ბრუნდება" },
        { id: "returned_fixed", name: "შეკეთებული ტექნიკა დაბრუნდა" },
        { id: "completed", name: "დასრულდა წარმატებით" },
        // cancel
        { id: "repair_cancelled", name: "შეკეთებაზე დაფიქსირდა უარი" },
        { id: "broken_ready", name: "შეუკეთებელი ტექნიკა მზად არის დაბრუნებისთვის" },
        { id: "returning_broken", name: "ბრუნდება შეუკეთებელი ტექნიკა" },
        { id: "returned_broken", name: "დაბრუნდა შეუკეთებელი ტექნიკა" },
        { id: "cancelled", name: "დასრულდა შეუკეთებლად" },

        // on site
        { id: "technician_coming", name: "ტექნიკოსი გზაშია" },
        { id: "installing", name: "მიმდინარეობს მონტაჟი" },
        { id: "repairing_on_site", name: "მიმდინარეობს ადგილზე შეკეთება" },
        { id: "waiting_payment", name: "ანგარიშსწორების მოლოდინში" },
        { id: "completed_on_site_installing", name: "მონტაჟი დასრულდა" },
        { id: "completed_on_site_repairing", name: "ადგილზე შეკეთება დასრულდა" },
    ],
}));