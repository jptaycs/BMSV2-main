import { api } from "@/service/api";
import { User } from "@/types/apitypes";

export interface ErrorResponse {
  message: string;
  error: string
}
export interface LoginResponse {
  message: string
  user: User
}

export default async function Login(role: string, username: string, password: string): Promise<LoginResponse | ErrorResponse> {
  try {
console.log(api)
    const res = await fetch(`${api}/auth/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: role,
        username: username,
        password: password,
      })
    })
    if (!res.ok) {
      const error = await res.json() as ErrorResponse
      throw error
    }
    return res.json() as Promise<LoginResponse>
  } catch (err) {
    throw err
  }
}
