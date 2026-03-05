import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useOrderFlowStore } from "../store/useOrderFlowStore";
import { api } from "../lib/api/axios";

export function useOrderActions() {
    const queryClient = useQueryClient();
    const { setLoadingAction } = useOrderFlowStore();
    
    const handle = async (
        action: string,
        request: () => Promise<any>,
        successMsg: string
    ) => {
        try {
            setLoadingAction(action);
            await request();
            toast.success(successMsg);
            queryClient.invalidateQueries({ queryKey: ["staffOrders"] });
            queryClient.invalidateQueries({ queryKey: ["userOrder"] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "შეცდომა");
            setLoadingAction(null);
        }
    };

    return {
        // DELIVERY
        startPickup: (id: number) =>
            handle(
                "startPickup",
                () => api.patch(`/delivery/orders/${id}/pickup-started`),
                "თქვენ მიდიხართ ტექნიკის ასაღებად"
            ),

        pickedUp: (id: number) =>
            handle(
                "pickedUp",
                () => api.patch(`/delivery/orders/${id}/picked-up`),
                "თქვენ აიღეთ ტექნიკა"
            ),

        deliveredToTechnician: (id: number) =>
            handle(
                "deliveredToTechnician",
                () => api.patch(`/delivery/orders/${id}/delivered-to-technician`),
                "თქვენ გადაეცით ტექნიკა ტექნიკოსს"
            ),

        returningFixed: (id: number) =>
            handle(
                "returningFixed",
                () => api.patch(`/delivery/orders/${id}/returning-fixed`),
                "თქვენ აბრუნებთ შეკეთებულ ტექნიკას"
            ),

        returnedFixed: (id: number) =>
            handle(
                "returnedFixed",
                () => api.patch(`/delivery/orders/${id}/returned-fixed`),
                "თქვენ დააბრუნეთ შეკეთებული ტექნიკა"
            ),

        returningBroken: (id: number) =>
            handle(
                "returningBroken",
                () => api.patch(`/delivery/orders/${id}/returning-broken`),
                "თქვენ აბრუნებთ შეუკეთებელ ტექნიკას"
            ),

        returnedBroken: (id: number) =>
            handle(
                "returnedBroken",
                () => api.patch(`/delivery/orders/${id}/returned-broken`),
                "თქვენ დააბრუნეთ შეუკეთებელი ტექნიკა"
            ),

        // technician
        inspection: (id: number) =>
            handle(
                "inspection",
                () => api.patch(`/technician/orders/${id}/inspection`),
                "თქვენ დაიწყეთ დიაგნოსტიკა"
            ),

        waitingDecision: (id: number, values: { payment_amount: string, payment_reason: string }) =>
            handle(
                "waitingDecision",
                () => api.patch(`/technician/orders/${id}/waiting-decision`, {
                    payment_amount: Number(values.payment_amount),
                    payment_reason: values.payment_reason
                }),
                "პრობლემა და ხარჯი აიტვირთა"
            ),

        fixedReady: (id: number) =>
            handle(
                "fixedReady",
                () => api.patch(`/technician/orders/${id}/fixed-ready`),
                "თქვენ დაასრულეთ ტექნიკის შეკეთება"
            ),

        brokenReady: (id: number) =>
            handle(
                "brokenReady",
                () => api.patch(`/technician/orders/${id}/broken-ready`),
                "თქვენ გაამზადეთ შეუკეთებელი ტექნიკა დასაბრუნებლად"
            ),
        technicianComing: (id: number) =>
            handle(
                "technicianComing",
                () => api.patch(`/technician/orders/${id}/technician-coming`),
                "თქვენ მიდიხართ ადგილზე"
            ),
        installing: (id: number) =>
            handle(
                "installing",
                () => api.patch(`/technician/orders/${id}/installing`),
                "თქვენ დაიწყეთ მონტაჟი"
            ),
        repairingOnSite: (id: number) =>
            handle(
                "repairingOnSite",
                () => api.patch(`/technician/orders/${id}/repairing-on-site`),
                "თქვენ დაიწყეთ ადგილზე შეკეთება"
            ),
        waitingPayment: (id: number, values: { payment_amount: string, payment_reason: string }) =>
            handle(
                "waitingPayment",
                () => api.patch(`/technician/orders/${id}/waiting-payment`, {
                    payment_amount: Number(values.payment_amount),
                    payment_reason: values.payment_reason
                }),
                "მომსახურების ხარჯი აიტვირთა"
            ),

        // users
        toTechnician: (id: number, role: "company" | "individual") =>
            handle(
                "toTechnician",
                () => api.patch(`/${role}/orders/${id}/to-technician`),
                "თქვენ გადაეცით ტექნიკა კურიერს"
            ),
        decision: (actionKey: "decisionApprove" | "decisionCancel", id: number, values: { decision: string, reason?: string }, role: "company" | "individual") =>
            handle(
                actionKey,
                () => api.patch(`/${role}/orders/${id}/decision`, {
                    decision: values.decision,
                    reason: values.reason
                }),
                actionKey === "decisionApprove" ? "თქვენ დაადასტურეთ შეკეთება" : "თქვენ შეკეთებაზე უარი დააფიქსირეთ"
            ),
        cancelled: (id: number, role: "company" | "individual") =>
            handle(
                "cancelled",
                () => api.patch(`/${role}/orders/${id}/cancelled`),
                "თქვენ ჩაიბარეთ შეუკეთებელი ტექნიკა"
            ),
        completed: (id: number, role: "company" | "individual") =>
            handle(
                "completed",
                () => api.patch(`/${role}/orders/${id}/completed`),
                "თქვენ ჩაიბარეთ შეკეთებელი ტექნიკა"
            ),
        completedOnSite: (id: number, role: "company" | "individual") =>
            handle(
                "completedOnSite",
                () => api.patch(`/${role}/orders/${id}/completed-on-site`),
                "მომსახურება წარმატებით დასრულდა"
            ),
    };
}
