"use client";

import axios from "axios";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface ResThread {
  id: string;
  object: string;
  created_at: string;
}

interface ReqThread {
  messages: { role: "user" | "assistant"; content: string }[];
}

const postThread = async ({ messages }: ReqThread) => {
  const response = await axios.post(
    `https://api.openai.com/v1/threads`,
    { messages },
    {
      headers: {
        Authorization: `Bearer `,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );
  return response.data;
};

const usePostThread = (options?: UseMutationOptions<ResThread, AxiosError>) => {
  return useMutation<ResThread, AxiosError>({
    mutationFn: postThread,
    ...options,
  });
};

export default usePostThread;
