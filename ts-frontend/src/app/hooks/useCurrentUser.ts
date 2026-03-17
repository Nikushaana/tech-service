"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/app/lib/api/axios";

const fetchCurrentUser = async () => {
    try {
        const { data } = await api.get("auth/current-user");
        return data;
    } catch (err: any) {
        // Try refresh token if not missing
        if (err.response?.data?.message !== "Token missing") {
            try {
                await api.post("auth/refresh-token");
                const { data } = await api.get("auth/current-user");
                return data;
            } catch {
                return null;
            }
        }
        return null;
    }
};

export function useCurrentUser() {
    const query = useQuery({
        queryKey: ["currentUser"],
        queryFn: fetchCurrentUser,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    return query;
}