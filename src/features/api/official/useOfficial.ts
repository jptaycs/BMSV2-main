
import getOfficial, { OfficialResponse } from "@/service/api/official/getOfficial";
import { useQuery } from "@tanstack/react-query";

export function useOfficial(id?: number) {
  const query = useQuery({
    queryKey: ['officials'],
    queryFn: (): Promise<OfficialResponse> => getOfficial(id),
    refetchInterval: 5000,
    structuralSharing: true,
  })
  return {
    ...query,
    isLoading: query.isFetching,
    error: query.isError
  }
}
