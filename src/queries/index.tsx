import { useQuery } from "@tanstack/react-query";
import { getSchedule, getSchedules } from "../api/apiSchedule";
import { ActivityPrototypeMap, getActivityPrototypesMapped } from "../api/apiActivityPrototype";
import { getActivitiesMapped, getAllActivitiesMapped, getGlobalActivitiesMapped } from "../api/apiActivity"; 

export function useScheduleQuery(id: string) {
    return useQuery({
        queryKey: ["schedule", id],
        queryFn: async () => getSchedule(id),
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    });
}

export function useActivityPrototypesQuery(id: string) {
    return useQuery({
        queryKey: ["activityPrototypes", id],
        queryFn: async () => getActivityPrototypesMapped(id),
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    });
}

export function useSchedulesQuery() {
    return useQuery({
        queryKey: ['schedules'],
        queryFn: getSchedules,
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    });
}

export function useActivitiesQuery(id: string, protos: ActivityPrototypeMap | undefined) {
    return useQuery({
        queryKey: ['activity', id],
        queryFn: async () => getActivitiesMapped(protos as ActivityPrototypeMap),
        enabled: !!protos,
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    })
}

export function useGlobalActivitiesQuery(id: string, protos: ActivityPrototypeMap | undefined) {
    return useQuery({
        queryKey: ['globalActivity', id],
        queryFn: async () => getGlobalActivitiesMapped(id),
        enabled: !!protos,
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    })
}

export function useAllActivityiesQuery(id: string, protos: ActivityPrototypeMap | undefined) {
    return useQuery({
        queryKey: ['allActivities', id],
        queryFn: async () => getAllActivitiesMapped(id,protos as ActivityPrototypeMap),
        enabled: !!protos,
        staleTime: 60*1000,
        refetchOnWindowFocus: true
    })
}