import { useQuery } from "@tanstack/react-query";
import { Schedule, getSchedule, getSchedules } from "../api/apiSchedule";
import { ActivityPrototypeMap, getActivityPrototypesMapped } from "../api/apiActivityPrototype"; 

export function useScheduleQuery(id: string) {
    return useQuery<Schedule>({
        queryKey: ["schedule", id],
        queryFn: async () => getSchedule(id),
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    });
}

export function useActivityPrototypesQuery(id: string) {
    return useQuery<ActivityPrototypeMap>({
        queryKey: ["activityPrototypes", id],
        queryFn: async () => getActivityPrototypesMapped(id),
        staleTime: 60*1000,
        refetchOnWindowFocus: false
    });
}

export function useSchedulesQuery() {
    return useQuery<Schedule[]>({
        queryKey: ['schedules'],
        queryFn: getSchedules
    });
}