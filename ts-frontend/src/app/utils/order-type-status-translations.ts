export const typeLabels: Record<string, string> = {
  installation: "მონტაჟი",
  fix_off_site: "შეკეთება სერვისცენტრში",
  fix_on_site: "შეკეთება ადგილზე",
};

export const statusLabels: Record<string, string> = {
  pending: "მიღებულია",
  assigned: "გადაცემულია",

  // off site
  pickup_started: "კურიერი გზაშია",
  picked_up: "ტექნიკა ჩატვირთულია",
  to_technician: "მიდის ტექნიკოსთან",
  delivered_to_technician: "ტექნიკოსის ხელშია",
  inspection: "დიაგნოსტიკა",
  waiting_decision: "გადაწყვეტილების მოლოდინში",
  // approve
  repairing_off_site: "სერვისი მიმდინარეობს სერვისცენტრში",
  fixed_ready: "შეკეთებულია",
  returning_fixed: "შეკეთებული ტექნიკა ბრუნდება",
  returned_fixed: "შეკეთებული ტექნიკა დაბრუნდა",
  completed: "დასრულდა",
  // cancel
  repair_cancelled: "სერვისი გაუქმდა",
  broken_ready: "დაზიანებული ტექნიკა მზად არის დაბრუნებისთვის",
  returning_broken: "დაზიანებული ტექნიკა ბრუნდება",
  returned_broken: "დაზიანებული ტექნიკა დაბრუნდა",
  cancelled: "გაუქმდა",

  // on site
  technician_coming: "ტექნიკოსი გზაშია",
  installing: "მიმდინარეობს ინსტალაცია",
  repairing_on_site: "შეკეთება მიმდინარეობს ადგილზე",
  waiting_payment: "ანგარიშსწორების მოლოდინში",
  completed_on_site_installing: "ინსტალაცია დასრულდა",
  completed_on_site_repairing: "ადგილზე შეკეთება დასრულდა",
};

export const statusDescriptions: Record<string, string> = {
  pending: "განაცხადი მიღებულია და დამუშავებას ელოდება.",
  assigned: "გადაცემულია კურიერსა და ტექნიკოსზე.",

  // off site
  pickup_started: "კურიერი გზაშია ტექნიკის ასაღებად.",
  picked_up: "ტექნიკა ჩატვირთულია სერვისცენტრში წასაღებად.",
  to_technician: "ტექნიკა მიემართება ტექნიკოსთან სერვისცენტრში შეკეთებისთვის.",
  delivered_to_technician: "ტექნიკა ტექნიკოსის ხელშია და ელოდება დიაგნოსტიკას.",
  inspection: "მიმდინარეობს ტექნიკის დიაგნოსტიკა.",
  waiting_decision: "ტექნიკა ელოდება მომხმარებლის გადაწყვეტილებას შეკეთების დასაწყებად.",
  // approve
  repairing_off_site: "მიმდინარეობს ტექნიკის შეკეთება სერვისცენტრში.",
  fixed_ready: "შეკეთებული ტექნიკა მზად არის დასაბრუნებლად.",
  returning_fixed: "შეკეთებული ტექნიკა ბრუნდება მომხმარებელთან.",
  returned_fixed: "შეკეთებული ტექნიკა დაბრუნდა მომხმარებელთან.",
  completed: "შეკვეთა წარმატებით დასრულდა.",
  // cancel
  repair_cancelled: "სერვისი გაუქმებულია.",
  broken_ready: "დაზიანებული ტექნიკა მზად არის დასაბრუნებლად.",
  returning_broken: "დაზიანებული ტექნიკა ბრუნდება მომხმარებელთან.",
  returned_broken: "დაზიანებული ტექნიკა დაბრუნდა მომხმარებელთან.",
  cancelled: "დასრულდა გაუქმებული შეკვეთა.",

  // on site
  technician_coming: "ტექნიკოსი გზაშია.",
  installing: "მიმდინარეობს ტექნიკის ინსტალაცია.",
  repairing_on_site: "მიმდინარეობს ტექნიკის შეკეთება ადგილზე.",
  waiting_payment: "მომხმარებლის ანგარიშსწორების მოლოდინში.",
  completed_on_site_installing: "ინსტალაცია წარმატებით დასრულდა.",
  completed_on_site_repairing: "შეკეთება ადგილზე წარმატებით დასრულდა.",
};