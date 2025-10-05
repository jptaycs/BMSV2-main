import { api } from "@/service/api";
import { ErrorResponse } from "../auth/login";
import { Official } from "@/types/apitypes";

export interface OfficialResponse {
  officials: Official[]
}

export default async function getOfficials(ID?: number): Promise<OfficialResponse> {
  try {
    const url = ID ? `${api}/officials/${ID}` : `${api}/officials`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    })
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<OfficialResponse>
  } catch (error) {
    throw error
  }
} 
