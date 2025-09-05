import { create } from "zustand";

interface MenuItem {
    id: number;
    text: string;
    target: string;
}


interface MenuStore {
    menu: MenuItem[];
}

export const useMenuStore = create<MenuStore>(() => ({
    menu: [
        { id: 1, text: "მთავარი", target: "hero" },
        { id: 2, text: "რატომ Tech Service?", target: "whychoose" },
        { id: 3, text: "შეფასებები", target: "usercomments" },
        { id: 4, text: "FAQ", target: "faq" },
    ],
}));