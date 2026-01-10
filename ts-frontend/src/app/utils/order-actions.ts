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
        label: "მივდივარ ტექნიკის ასაღებად",
    },
    {
        key: "pickedUp",
        role: ["delivery"],
        status: ["pickup_started"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა ავიღე",
    },
    {
        key: "deliveredToTechnician",
        role: ["delivery"],
        status: ["to_technician"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა მივაწოდე ტექნიკოსს",
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
        label: "შეკეთებული ტექნიკა დავაბრუნე",
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
        label: "შეუკეთებელი ტექნიკა დავაბრუნე",
    },
    // TECHNICIAN
    {
        key: "inspection",
        role: ["technician"],
        status: ["delivered_to_technician"],
        serviceType: ["fix_off_site"],
        label: "დიაგნოსტიკის დაწყება",
    },
    {
        key: "waitingDecision",
        role: ["technician"],
        status: ["inspection"],
        serviceType: ["fix_off_site"],
        label: "ხარჯის და პრობლემის ატვირთვა",
    },
    {
        key: "fixedReady",
        role: ["technician"],
        status: ["repairing_off_site"],
        serviceType: ["fix_off_site"],
        label: "შეკეთება დასრულდა",
    },
    {
        key: "brokenReady",
        role: ["technician"],
        status: ["repair_cancelled"],
        serviceType: ["fix_off_site"],
        label: "შეუკეთებელი ტექნიკა გამზადდა",
    },
    {
        key: "technicianComing",
        role: ["technician"],
        status: ["assigned"],
        serviceType: ["installation", "fix_on_site"],
        label: "მივდივარ ადგილზე",
    },
    {
        key: "installing",
        role: ["technician"],
        status: ["technician_coming"],
        serviceType: ["installation"],
        label: "მონტაჟის დაწყება",
    },
    {
        key: "repairingOnSite",
        role: ["technician"],
        status: ["technician_coming"],
        serviceType: ["fix_on_site"],
        label: "შეკეთების დაწყება",
    },
    {
        key: "waitingPayment",
        role: ["technician"],
        status: ["installing", "repairing_on_site"],
        serviceType: ["installation", "fix_on_site"],
        label: "ხარჯის ატვირთვა",
    },
    // user
    {
        key: "toTechnician",
        role: ["company", "individual"],
        status: ["picked_up"],
        serviceType: ["fix_off_site"],
        label: "ტექნიკა გადაეცა კურიერს",
    },
    {
        key: "decisionApprove",
        role: ["company", "individual"],
        status: ["waiting_decision"],
        serviceType: ["fix_off_site"],
        label: "შეკეთებაზე თანხმობა",
    },
    {
        key: "decisionCancel",
        role: ["company", "individual"],
        status: ["waiting_decision"],
        serviceType: ["fix_off_site"],
        label: "შეკეთებაზე უარის თქმა",
    },
    {
        key: "cancelled",
        role: ["company", "individual"],
        status: ["returned_broken"],
        serviceType: ["fix_off_site"],
        label: "შეუკეთებელი ტექნიკა ჩავიბარე",
    },
    {
        key: "completed",
        role: ["company", "individual"],
        status: ["returned_fixed"],
        serviceType: ["fix_off_site"],
        label: "შეკეთებული ტექნიკა ჩავიბარე",
    },
    {
        key: "completedOnSite",
        role: ["company", "individual"],
        status: ["waiting_payment"],
        serviceType: ["installation", "fix_on_site"],
        label: "მომსახურება დასრულებულია",
    },
];