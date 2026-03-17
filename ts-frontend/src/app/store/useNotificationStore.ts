import { create } from "zustand";

interface Option {
    id: number;
    name: string;
    nameEng: string;
}

interface NotificationsStoreState {
    notificationTypeOptions: Option[];
    openFilterNotificationModal: boolean;

    toggleOpenFilterNotificationModal: () => void;
}

export const useNotificationsStore = create<NotificationsStoreState>((set) => ({
    notificationTypeOptions: [
        { id: 2, name: "დამატებული განცხადებები", nameEng: "new_order" },
        { id: 3, name: "განცხადებების ცვლილებები", nameEng: "order_updated" },
        { id: 4, name: "დამატებული შეფასებები", nameEng: "new_review" },
        { id: 5, name: "რეგისტრაცია", nameEng: "new_user" },
        { id: 6, name: "პროფილის ცვლილებები", nameEng: "profile_updated" },
    ],
    openFilterNotificationModal: false,

    toggleOpenFilterNotificationModal: () =>
        set((state) => ({
            openFilterNotificationModal: !state.openFilterNotificationModal,
        })),
}));