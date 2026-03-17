import { create } from "zustand";

type MediaItem = {
  url: string;
  type: "image" | "video";
};

type OrderMediaState = {
  media: MediaItem[];
  currentIndex: number | null;

  openMedia: (media: MediaItem[], index: number) => void;
  closeMedia: () => void;

  next: () => void;
  prev: () => void;
};

export const useOrderMediaStore = create<OrderMediaState>((set, get) => ({
  media: [],
  currentIndex: null,

  openMedia: (media, index) =>
    set({
      media,
      currentIndex: index,
    }),

  closeMedia: () =>
    set({
      currentIndex: null,
      media: [],
    }),

  next: () => {
    const { media, currentIndex } = get();
    if (currentIndex === null) return;

    set({
      currentIndex: (currentIndex + 1) % media.length,
    });
  },

  prev: () => {
    const { media, currentIndex } = get();
    if (currentIndex === null) return;

    set({
      currentIndex: (currentIndex - 1 + media.length) % media.length,
    });
  },
}));