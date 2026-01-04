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

        // DELIVERY
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
                "დაფიქსირდა ტექნიკის აღება"
            ),

        deliveredToTechnician: (id: number) =>
            handle(
                "deliveredToTechnician",
                () => axiosDelivery.patch(`/delivery/orders/${id}/delivered-to-technician`),
                "ტექნიკა წარმატებით გადაეცა ტექნიკოსს"
            ),

        returningFixed: (id: number) =>
            handle(
                "returningFixed",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returning-fixed`),
                "ბრუნდება შეკეთებული ტექნიკა"
            ),

        returnedFixed: (id: number) =>
            handle(
                "returnedFixed",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returned-fixed`),
                "შეკეთებული ტექნიკა წარმატებით დაბრუნდა მომხმარებელთან"
            ),

        returningBroken: (id: number) =>
            handle(
                "returningBroken",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returning-broken`),
                "ბრუნდება შეუკეთებული ტექნიკა"
            ),

        returnedBroken: (id: number) =>
            handle(
                "returnedBroken",
                () => axiosDelivery.patch(`/delivery/orders/${id}/returned-broken`),
                "შეუკეთებული ტექნიკა დაბრუნდა მომხმარებელთან"
            ),

        // technician
        inspection: (id: number) =>
            handle(
                "inspection",
                () => axiosTechnician.patch(`/technician/orders/${id}/inspection`),
                "დიაგნოსტიკა დაწყებულია"
            ),

        waitingDecision: (id: number, values: { payment_amount: string, payment_reason: string }) =>
            handle(
                "waitingDecision",
                () => axiosTechnician.patch(`/technician/orders/${id}/waiting-decision`, {
                    payment_amount: Number(values.payment_amount),
                    payment_reason: values.payment_reason
                }),
                "პრობლემა და ხარჯი აიტვირთა — ველოდებით მომხმარებლის გადაწყვეტილებას"
            ),

        fixedReady: (id: number) =>
            handle(
                "fixedReady",
                () => axiosTechnician.patch(`/technician/orders/${id}/fixed-ready`),
                "ტექნიკის შეკეთება დასრულებულია"
            ),

        brokenReady: (id: number) =>
            handle(
                "brokenReady",
                () => axiosTechnician.patch(`/technician/orders/${id}/broken-ready`),
                "შეუკეთებელი ტექნიკა მზად არის დასაბრუნებლად"
            ),
        technicianComing: (id: number) =>
            handle(
                "technicianComing",
                () => axiosTechnician.patch(`/technician/orders/${id}/technician-coming`),
                "ტექნიკოსი გზაშია"
            ),
        installing: (id: number) =>
            handle(
                "installing",
                () => axiosTechnician.patch(`/technician/orders/${id}/installing`),
                "მონტაჟი დაწყებულია"
            ),
        repairingOnSite: (id: number) =>
            handle(
                "repairingOnSite",
                () => axiosTechnician.patch(`/technician/orders/${id}/repairing-on-site`),
                "ადგილზე შეკეთება დაწყებულია"
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
                "ტექნიკა გადაეცა კურიერს"
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
                actionKey === "decisionApprove" ? "შეკეთება დადასტურდა" : "შეკეთებაზე უარი დაფიქსირდა"
            ),
        cancelled: (id: number, role: "company" | "individual") =>
            handle(
                "cancelled",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/cancelled`),
                "შეუკეთებელი ტექნიკა ჩაბარდა"
            ),
        completed: (id: number, role: "company" | "individual") =>
            handle(
                "completed",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/completed`),
                "შეკეთებელი ტექნიკა ჩაბარდა"
            ),
        completedOnSite: (id: number, role: "company" | "individual") =>
            handle(
                "completedOnSite",
                () => (role === "company"
                    ? axiosCompany
                    : axiosIndividual
                ).patch(`/${role}/orders/${id}/completed-on-site`),
                "მომსახურება წარმატებით დასრულდა"
            ),
    };
}
