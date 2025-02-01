"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const ASSISTANT_LIST = "assistant_list";

interface ReqGetAssistantList {
  order: string;
  limit: string;
}

export interface ResGetAssistantListDataType {
  id: string;
  object: string;
  created_at: number;
  name: string;
  description: string;
  model: string;
  instructions: string;
  tools: { type: string }[];
  tool_resources: { file_search: { vector_store_ids: string[] } };
}

const getAssistantList = async ({ order, limit }: ReqGetAssistantList) => {
  try {
    const data = await axios.get(`https://api.openai.com/v1/assistants`, {
      params: {
        order,
        limit,
      },
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2",
      },
    });
    return data.data;
  } catch (err) {
    console.log("err ::: ", err);
  }
};

export const useGetAssistantList = ({ order, limit }: ReqGetAssistantList) => {
  return useQuery({
    queryKey: [ASSISTANT_LIST],
    queryFn: () => getAssistantList({ order, limit }),
    select: (data) => {
      return data.data.map((assistant: ResGetAssistantListDataType) => {
        if (!assistant.name) return assistant;
        return {
          ...assistant,
          name: assistant.name.includes(".")
            ? assistant.name.split(".").pop()?.trim()
            : assistant.name.trim(),
        };
      });
    },
  });
};
