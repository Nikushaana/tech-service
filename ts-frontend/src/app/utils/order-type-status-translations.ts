export const typeLabels: Record<string, string> = {
  fix_off_site: "შეკეთება სერვისცენტრში",
  installation: "მონტაჟი",
  fix_on_site: "შეკეთება ადგილზე",
};

export const statusLabels: Record<string, string> = {
  waiting_pre_payment: "წინასწარი ანგარიშსწორების მოლოდინში",
  pending: "მუშავდება",
  assigned: "გადანაწილებულია",

  // off site
  pickup_started: "კურიერი გზაშია",
  picked_up: "ტექნიკა ჩატვირთულია",
  to_technician: "მიდის ტექნიკოსთან",
  delivered_to_technician: "ტექნიკოსს გადაეცა",
  inspection: "მიმდინარეობს დიაგნოსტიკა",
  waiting_decision: "გადაწყვეტილების მოლოდინში",
  // approve
  waiting_repairing_off_site_payment: "სერვისცენტრში სერვისის დასაწყებად ანგარიშსწორების მოლოდინში",
  repairing_off_site: "სერვისი მიმდინარეობს სერვისცენტრში",
  fixed_ready: "შეკეთებულია",
  returning_fixed: "შეკეთებული ტექნიკა ბრუნდება",
  returned_fixed: "შეკეთებული ტექნიკა დაბრუნდა",
  completed: "დასრულდა წარმატებით",
  // cancel
  repair_cancelled: "შეკეთებაზე დაფიქსირდა უარი",
  broken_ready: "შეუკეთებელი ტექნიკა მზად არის დაბრუნებისთვის",
  returning_broken: "ბრუნდება შეუკეთებელი ტექნიკა",
  returned_broken: "დაბრუნდა შეუკეთებელი ტექნიკა",
  cancelled: "დასრულდა შეუკეთებლად",

  // on site
  technician_coming: "ტექნიკოსი გზაშია",
  installing: "მიმდინარეობს მონტაჟი",
  repairing_on_site: "მიმდინარეობს ადგილზე შეკეთება",
  waiting_payment: "ანგარიშსწორების მოლოდინში",
  completed_on_site_installing: "მონტაჟი დასრულდა",
  completed_on_site_repairing: "ადგილზე შეკეთება დასრულდა",
};

export const statusDescriptions: Record<string, string> = {
  waiting_pre_payment: "განაცხადი მიღებულია და ანგარიშსწორებას ელოდება",
  pending: "დამუშავებას ელოდება",
  assigned: "განაცხადი გადანაწილებულია",

  // off site
  pickup_started: "კურიერი გზაშია ტექნიკის ასაღებად",
  picked_up: "ტექნიკა ჩატვირთულია სერვისცენტრში წასაღებად",
  to_technician: "ტექნიკა მიემართება ტექნიკოსთან სერვისცენტრში შესაკეთებლად",
  delivered_to_technician: "ტექნიკა ტექნიკოსის ხელშია და ელოდება დიაგნოსტიკას",
  inspection: "მიმდინარეობს ტექნიკის დიაგნოსტიკა",
  waiting_decision: "ტექნიკა ელოდება მომხმარებლის გადაწყვეტილებას შეკეთების დასაწყებად",
  // approve
  waiting_repairing_off_site_payment: "სერვისცენტრში სერვისის დასაწყებად ანგარიშსწორების მოლოდინში",
  repairing_off_site: "მიმდინარეობს ტექნიკის შეკეთება სერვისცენტრში",
  fixed_ready: "შეკეთებული ტექნიკა მზად არის დასაბრუნებლად",
  returning_fixed: "შეკეთებული ტექნიკა ბრუნდება მომხმარებელთან",
  returned_fixed: "შეკეთებული ტექნიკა დაბრუნდა მომხმარებელთან",
  completed: "შეკეთება წარმატებით დასრულდა",
  // cancel
  repair_cancelled: "შეკეთებაზე დაფიქსირდა უარი",
  broken_ready: "შეუკეთებელი ტექნიკა მზად არის დასაბრუნებლად",
  returning_broken: "შეუკეთებელი ტექნიკა ბრუნდება მომხმარებელთან",
  returned_broken: "შეუკეთებელი ტექნიკა დაბრუნდა მომხმარებელთან",
  cancelled: "დასრულდა შეუკეთებლად",

  // on site
  technician_coming: "ტექნიკოსი გზაშია",
  installing: "მიმდინარეობს ტექნიკის მონტაჟი",
  repairing_on_site: "მიმდინარეობს ტექნიკის შეკეთება ადგილზე",
  waiting_payment: "მომხმარებლის ანგარიშსწორების მოლოდინში",
  completed_on_site_installing: "მონტაჟი წარმატებით დასრულდა",
  completed_on_site_repairing: "შეკეთება ადგილზე წარმატებით დასრულდა",
};