import { useMutation, useQuery } from "@tanstack/react-query";
import { instance } from "../axios";
import { loginInput, signupInput } from "@/schemas/auth";
import { toast } from "sonner";

async function signup(data: signupInput) {
  const response = await instance.post("/auth/register", data);
  return response.data;
}

export function useSignup() {
  return useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      toast.success(
        data.message || "Please check ur email for email verification",
      );
    },
    onError: (error) => {
      toast.error(error.message || "Signup failed. Please try again");
    },
  });
}

async function login(data: loginInput) {
  const response = await instance.post("/auth/login", data);
  return response.data;
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      toast.success(data.message || "Logged in successfully");
    },
    onError: (error) => {
      console.log(error);
      toast.error(error.message || "Login failed. Please try again");
    },
  });
}

async function logout() {
  const response = await instance.post("/auth/logout");
  return response.data;
}

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      toast.success(data.message || "Logged out successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Logout failed");
    },
  });
}
