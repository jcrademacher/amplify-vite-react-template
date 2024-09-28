import { useMatch, NavigateFunction } from "react-router-dom";

export function useScheduleIDMatch() {
    return useMatch("/schedule/:scheduleId");
} 

export function navigateToSchedule(navigate: NavigateFunction, id: string) {
    navigate(`/schedule/${id}`);
}