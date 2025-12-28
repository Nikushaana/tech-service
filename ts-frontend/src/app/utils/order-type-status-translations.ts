export const typeLabels: Record<string, string> = {
  installation: "მონტაჟი",
  fix_off_site: "შეკეთება სერვისცენტრში",
  fix_on_site: "შეკეთება ადგილზე",
};

export const statusLabels: Record<string, string> = {
  pending: "მიღებულია",
  assigned: "გადაცემულია",
  pickup_started: "კურიერი გზაშია",

  technician_coming: "ტექნიკოსი გზაშია",
  
  picked_up: "აღებულია",
  to_technician: "ტექნიკოსთან მიდის",
  delivered_to_technician: "ტექნიკოსთან მიწოდებულია",
  inspection: "დიაგნოსტიკა",
  waiting_payment: "ანგარიშსწორების მოლოდინი",

  repairing: "მიმდინარეობს შეკეთება",
  installing: "მიმდინარეობს ინსტალაცია",
  
  fixed_ready: "მზად არის",
  returning_fixed: "ბრუნდება",
  returned_fixed: "მიწოდებულია",
  completed: "დასრულდა",
  completed_on_site: "დასრულდა გამოძახებით",

  repair_cancelled: "სერვისი გაუქმდა",
  broken_ready: "მზად არის დაბრუნებისთვის",
  returning_broken: "ბრუნდება",
  returned_broken: "დაბრუნებულია",
  cancelled: "გაუქმებულია",
};

export const statusDescriptions: Record<string, string> = {
  pending: "განაცხადი მიღებულია და დამუშავებას ელოდება.",
  assigned: "გადაცემულია კურიერსა და ტექნიკოსზე.",
  pickup_started: "კურიერი გზაშია ტექნიკის ასაღებად.",

  technician_coming: "ტექნიკოსი გზაშია ტექნიკის შესაკეთებლად.",

  picked_up: "ტექნიკა მომხმარებლისგან აღებულია.",
  to_technician: "ტექნიკა მიემართება ტექნიკოსთან.",
  delivered_to_technician: "ტექნიკა წარმატებით მიწოდებულია ტექნიკოსთან.",
  inspection: "ტექნიკის დიაგნოსტიკა მიმდინარეობს.",
  waiting_payment: "მომხმარებლის ანგარიშსწორების მოლოდინში",

  repairing: "ტექნიკის შეკეთება მიმდინარეობს ტექნიკოსის მიერ.",
  installing: "ტექნიკის ინსტალაცია მიმდინარეობს ტექნიკოსის მიერ.",

  fixed_ready: "შეკეთებული ტექნიკა მზად არის დაბრუნებისთვის.",
  returning_fixed: "შეკეთებული ტექნიკა ბრუნდება მომხმარებელთან.",
  returned_fixed: "შეკეთებული ტექნიკა უკვე მიწოდებულია მომხმარებელთან.",
  completed: "შეკვეთა წარმატებით დასრულდა.",
  completed_on_site: "შეკვეთა ტექნიკოსის გამოძახებით წარმატებით დასრულდა.",

  repair_cancelled: "სერვისი გაუქმებულია.",
  broken_ready: "დაზიანებული ტექნიკა მზად არის დაბრუნებისთვის.",
  returning_broken: "დაზიანებული ტექნიკა ბრუნდება მომხმარებელთან.",
  returned_broken: "დაზიანებული ტექნიკა უკვე მიწოდებულია მომხმარებელთან.",
  cancelled: "შეკვეთა გაუქმებულია და დახურულია.",
};