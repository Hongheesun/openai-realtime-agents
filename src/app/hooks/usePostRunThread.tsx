"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axios from "axios";

interface ReqMessage {
  thread_id: string;
  assistant_id: string;
}

interface ResMessage {
  id: string;
  //   object: string;
  //   created_at: number;
  //   thread_id: string;
  //   role: string;
  //   file_ids: string[];
  //   assistant_id: string;
}

const postRunThread = async ({ thread_id, assistant_id }: ReqMessage) => {
  const response = await axios.post(
    `https://api.openai.com/v1/threads/${thread_id}/runs`,
    { assistant_id },
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

const usePostRunThread = (
  options?: UseMutationOptions<ResMessage, AxiosError, ReqMessage>
) => {
  return useMutation<ResMessage, AxiosError, ReqMessage>({
    mutationFn: postRunThread,
    ...options,
  });
};

export default usePostRunThread;
