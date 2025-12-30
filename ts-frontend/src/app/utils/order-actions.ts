export type Role = "company" | "individual" | "technician" | "delivery";

export type OrderActionKey =
    | "startPickup"
    | "pickedUp"
    | "deliveredToTechnician"
    | "returningFixed"
    | "returnedFixed"
    | "returningBroken"
    | "returnedBroken"

    | "inspection"
    | "waitingDecision"
    | "fixedReady"
    | "brokenReady"
    | "technicianComing"
    | "installing"
    | "repairingOnSite"
    | "waitingPayment"

    | "toTechnician"
    | "decisionApprove"
    | "decisionCancel"
    | "cancelled"
    | "completed"
    | "completedOnSite";

export type OrderAction = {
    key: OrderActionKey;
    role: Role[];
    status: string[];
    serviceType?: string[];
    label: string;
};

export const orderActions: OrderAction[] = [
    // DELIVERY
    {
        key: "startPickup",
        role: ["delivery"],
        status: ["assigned"],
        serviceType: ["fix_off_site"],
        label: "წავედი ტექნიკის ასაღებად",
    },
    {
        key: "pickedUp",
        role: ["delivery"],
        status: ["pickup_started"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა ჩავტვირთე ტექნიკოსთან წასაღებად",
    },
    {
        key: "deliveredToTechnician",
        role: ["delivery"],
        status: ["to_technician"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა მივიტანე ტექნიკოსთან",
    },
    {
        key: "returningFixed",
        role: ["delivery"],
        status: ["fixed_ready"],
        serviceType: ["fix_off_site"],
        label: "ვაბრუნებ შეკეთებულ ტექნიკას",
    },
    {
        key: "returnedFixed",
        role: ["delivery"],
        status: ["returning_fixed"],
        serviceType: ["fix_off_site"],
        label: "შეკეთებული ტექნიკა დავუბრუნე მომხმარებელს",
    },
    {
        key: "returningBroken",
        role: ["delivery"],
        status: ["broken_ready"],
        serviceType: ["fix_off_site"],
        label: "ვაბრუნებ შეუკეთებელ ტექნიკას",
    },
    {
        key: "returnedBroken",
        role: ["delivery"],
        status: ["returning_broken"],
        serviceType: ["fix_off_site"],
        label: "შეუკეთებელი ტექნიკა დავაბრუნე მომხმარებელს",
    },
    // TECHNICIAN
    {
        key: "inspection",
        role: ["technician"],
        status: ["delivered_to_technician"],
        serviceType: ["fix_off_site"],
        label: "ვაკეთებ დიაგნოსტიკას",
    },
    {
        key: "waitingDecision",
        role: ["technician"],
        status: ["inspection"],
        serviceType: ["fix_off_site"],
        label: "პრობლემის და ხარჯის ატვირთვა",
    },
    {
        key: "fixedReady",
        role: ["technician"],
        status: ["repairing_off_site"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა შეკეთდა",
    },
    {
        key: "brokenReady",
        role: ["technician"],
        status: ["repair_cancelled"],
        serviceType: ["fix_off_site"],
        label: "შეუკეთებელი ტექნიკა მზად არის",
    },
    {
        key: "technicianComing",
        role: ["technician"],
        status: ["assigned"],
        serviceType: ["installation"],
        label: "წავედი ადგილზე გმოძახებაზე",
    },
    {
        key: "installing",
        role: ["technician"],
        status: ["technician_coming"],
        serviceType: ["installation"],
        label: "ვამონტაჟებ",
    },
    {
        key: "repairingOnSite",
        role: ["technician"],
        status: ["technician_coming"],
        serviceType: ["fix_on_site"],
        label: "ვარემონტებ ადგილზე",
    },
    {
        key: "waitingPayment",
        role: ["technician"],
        status: ["installing", "repairing_on_site"],
        serviceType: ["installation", "fix_on_site"],
        label: "მომსახურების ხარჯის ატვირთვა",
    },
    // user
    {
        key: "toTechnician",
        role: ["company", "individual"],
        status: ["picked_up"],
        serviceType: ["fix_off_site"],
        label: "კურიერმა ტექნიკა წაიღო",
    },
    {
        key: "decisionCancel",
        role: ["company", "individual"],
        status: ["waiting_decision"],
        serviceType: ["fix_off_site"],
        label: "სერვისის გაუქმება",
    },
    {
        key: "decisionApprove",
        role: ["company", "individual"],
        status: ["waiting_decision"],
        serviceType: ["fix_off_site"],
        label: "შეკეტდეს ტექნიკა",
    },
    {
        key: "cancelled",
        role: ["company", "individual"],
        status: ["returned_broken"],
        serviceType: ["fix_off_site"],
        label: "გაფუჭებული ტექნიკა ჩავიბარე",
    },
    {
        key: "completed",
        role: ["company", "individual"],
        status: ["returned_fixed"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა ჩავიბარე",
    },
    {
        key: "completedOnSite",
        role: ["company", "individual"],
        status: ["waiting_payment"],
        serviceType: ["fix_off_site"],
        label: "გამოძახებით მომსახურება წარმატებით შესრულდა",
    },
];