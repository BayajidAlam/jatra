import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axios-client";
import { API_ENDPOINTS } from "@/lib/constants";

export interface SearchJourneysParams {
  from: string;
  to: string;
  date: string;
  trainType?: string;
  page?: number;
  limit?: number;
}

export interface SearchStation {
  id: string;
  name: string;
  code: string;
  city: string;
}

export interface SearchResult {
  data: any[]; // refine type if possible
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  fromCache: boolean;
}

export const useTrainSearch = () => {
  const searchJourneys = async (params: SearchJourneysParams) => {
    const { data } = await apiClient.get<SearchResult>(
      API_ENDPOINTS.SCHEDULE.SEARCH,
      { params }
    );
    return data;
  };

  const getStations = async () => {
    const { data } = await apiClient.get<SearchStation[]>(
      API_ENDPOINTS.SCHEDULE.STATIONS
    );
    return data;
  };

  // We expose a query hook for stations as it's static-ish
  const useStations = () =>
    useQuery({
      queryKey: ["stations"],
      queryFn: getStations,
      staleTime: 1000 * 60 * 60, // 1 hour
    });

  return {
    searchJourneys, // exposed as async function for manual triggering on button click
    useStations,
  };
};
