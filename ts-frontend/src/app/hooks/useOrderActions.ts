import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { axiosCompany, axiosDelivery, axiosIndividual, axiosTechnician } from "@/app/api/axios";

export function useOrderActions() {
    const queryClient = useQueryClient();
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handle = async (
        action: string,
        request: () => Promise<any>,
        successMsg: string
    ) => {
        try {
            setLoadingAction(action);
            await request();
            toast.success(successMsg, {
                position: "bottom-right",
                autoClose: 3000,
            });
            queryClient.invalidateQueries({ queryKey: ["staffOrders"] });
            queryClient.invalidateQueries({ queryKey: ["userOrder"] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "შეცდომა");
        } finally {
            setLoadingAction(null);
        }
    };

    return {
        loadingAction,

        startPickup: (id: number) =>
            handle(
                "startPickup",
                () => axiosDelivery.patch(`/delivery/orders/${id}/pickup-started`),
                "კურიერი გზაშია ტექნიკის ასაღებად"
            ),

        pickedUp: (id: number) =>
            handle(
                "pickedUp",
                () => axiosDelivery.patch(`/delivery/orders/${id}/picked-up`),
                "ტექნიკა ჩატვირთულია"
            ),

        deliveredToTechnician: (id: number) =>
            handle(
                "deliveredToTechnician",
                () => axiosDelivery.patch(`/delivery/orders/${id}/delivered-to-technician`),
                "ტექნიკა მიწოდებულია ტექნიკოსთან"
            ),

        returningFixed: (id: number) =>
            handle(
                "returningFixed",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returning-fixed`),
                "შეკეთებული ტექნიკა ბრუნდება მომხმარებელთან"
            ),

        returnedFixed: (id: number) =>
            handle(
                "returnedFixed",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returned-fixed`),
                "შეკეთებული ტექნიკა დაბრუნდა მომხმარებელთან"
            ),

        returningBroken: (id: number) =>
            handle(
                "returningBroken",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returning-broken`),
                "შეუკეთებელი ტექნიკა ბრუნდება მომხმარებელთან"
            ),

        returnedBroken: (id: number) =>
            handle(
                "returnedBroken",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returned-broken`),
                "შეუკეთებელი ტექნიკა დაბრუნდა მომხმარებელთან"
            ),

        // technician
        inspection: (id: number) =>
            handle(
                "inspection",
                () => axiosTechnician.patch(`/technician/orders/${id}/inspection`),
                "მიმდინარეობს დიაგნოსტიკა"
            ),

        waitingDecision: (id: number, values: { payment_amount: string, payment_reason: string }) =>
            handle(
                "waitingDecision",
                () => axiosTechnician.patch(`/technician/orders/${id}/waiting-decision`, {
                    payment_amount: Number(values.payment_amount),
                    payment_reason: values.payment_reason
                }),
                "მიმდინარეობს დიაგნოსტიკა"
            ),

        fixedReady: (id: number) =>
            handle(
                "fixedReady",
                () => axiosTechnician.patch(`/technician/orders/${id}/fixed-ready`),
                "ტექნიკა შეკეთდა"
            ),

        brokenReady: (id: number) =>
            handle(
                "brokenReady",
                () => axiosTechnician.patch(`/technician/orders/${id}/broken-ready`),
                "შეუკეთებელი ტექნიკა მზად არის"
            ),
        technicianComing: (id: number) =>
            handle(
                "technicianComing",
                () => axiosTechnician.patch(`/technician/orders/${id}/technician-coming`),
                "წავედი ადგილზე გამოძახებაზე"
            ),
        installing: (id: number) =>
            handle(
                "installing",
                () => axiosTechnician.patch(`/technician/orders/${id}/installing`),
                "ვამონტაჟებ"
            ),
        repairingOnSite: (id: number) =>
            handle(
                "repairingOnSite",
                () => axiosTechnician.patch(`/technician/orders/${id}/repairing-on-site`),
                "ვარემონტებ ადგილზე"
            ),
        waitingPayment: (id: number, values: { payment_amount: string, payment_reason: string }) =>
            handle(
                "waitingPayment",
                () => axiosTechnician.patch(`/technician/orders/${id}/waiting-payment`, {
                    payment_amount: Number(values.payment_amount),
                    payment_reason: values.payment_reason
                }),
                "მომსახურების ხარჯი აიტვირთა"
            ),

        // users
        toTechnician: (id: number, role: "company" | "individual") =>
            handle(
                "toTechnician",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/to-technician`),
                "კურიერმა ტექნიკა წაიღო"
            ),
        decision: (actionKey: "decisionApprove" | "decisionCancel", id: number, values: { decision: string, reason?: string }, role: "company" | "individual") =>
            handle(
                actionKey,
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/decision`, {
                    decision: values.decision,
                    reason: values.reason
                }),
                "გადაწყვეტილება აიტვირთა"
            ),
        cancelled: (id: number, role: "company" | "individual") =>
            handle(
                "cancelled",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/cancelled`),
                "გაფუჭებული ტექნიკა ჩავიბარე"
            ),
        completed: (id: number, role: "company" | "individual") =>
            handle(
                "completed",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/completed`),
                "ტექნიკა ჩავიბარე"
            ),
        completedOnSite: (id: number, role: "company" | "individual") =>
            handle(
                "completedOnSite",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/completed-on-site`),
                "გამოძახებით მომსახურება წარმატებით შესრულდა"
            ),
    };
}
