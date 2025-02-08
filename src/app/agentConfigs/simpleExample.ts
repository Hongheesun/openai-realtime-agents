import { AgentConfig } from "@/app/types";
import { injectTransferTools } from "./utils";
import { Tool } from "@/app/types";

const queryVectorStoreTool: Tool = {
  type: "function",
  name: "queryVectorStore",
  description:
    "Searches for relevant content using OpenAI's Assistant API with vector store.",
  parameters: {
    type: "object",
    properties: {
      assistantId: {
        type: "string",
        description: "The ID of the assistant to process the request.",
      },
      query: {
        type: "string",
        description:
          "The search query to find relevant content using the assistant API.",
      },
    },
    required: ["assistantId", "query"],
  },
};

const haiku: AgentConfig = {
  name: "살린 카카오택시 이용가이드",
  publicDescription: "카카오택시 이용 방법을 설명하는 에이전트.",
  instructions:
    "당신은 살린 임직원의 카카오 택시 이용 가이드를 제시해주는 사람입니다. 당신에게 질문하는 사람을 살린 임직원이라 생각합니다. 당신은 제공 받은 파일 '카카오 택시 이용 가이드.pdf'에 기반하여 답변합니다. 당신은 대화하듯이 답변합니다. 그러기 위해 답변은 너무 길지 않게 합니다.",
  tools: [queryVectorStoreTool],
  toolLogic: {
    queryVectorStore: async ({ assistantId, query }) => {
      try {
        // ✅ 1. 새로운 Thread 생성
        const threadResponse = await fetch(
          `https://api.openai.com/v1/threads`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer `,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
          }
        );

        if (!threadResponse.ok) {
          throw new Error("Failed to create thread");
        }

        const threadData = await threadResponse.json();
        const threadId = threadData.id;

        console.log(`✅ Thread created: ${threadId}`);

        // ✅ 2. 메시지 추가
        const messageResponse = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer `,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
            body: JSON.stringify({
              role: "user",
              content: query,
            }),
          }
        );

        if (!messageResponse.ok) {
          throw new Error("Failed to add message to thread");
        }

        console.log(`✅ Message added to thread`);

        // ✅ 3. Thread 실행 (Run 시작)
        const runResponse = await fetch(
          `https://api.openai.com/v1/threads/${threadId}/runs`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer `,
              "Content-Type": "application/json",
              "OpenAI-Beta": "assistants=v2",
            },
            body: JSON.stringify({
              assistant_id: "asst_SBvdQxe9VosCAh2S2EEnAJkx",
              stream: true,
            }),
          }
        );

        if (!runResponse.ok) {
          throw new Error("Failed to start thread run");
        }

        // ✅ 4. 스트리밍 응답 처리
        const reader = runResponse.body?.getReader();
        const decoder = new TextDecoder();
        let completeMessage = "";

        console.log("🔄 Streaming response from Assistant...");
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          // JSON 형태의 여러 줄 데이터가 들어올 수도 있어서 한 줄씩 파싱
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");
          for (const line of lines) {
            console.log("line ::: ", line);
            // if (line.includes("event: thread.run.step.completed")) return;
            if (line.startsWith("data: ")) {
              try {
                const jsonString = line.replace("data: ", "").trim();
                const jsonData = JSON.parse(jsonString);

                if (jsonData.delta?.content?.length) {
                  const textValue = jsonData.delta.content
                    .map((content) => content.text?.value)
                    .filter(Boolean) // null, undefined 제거
                    .join("");

                  completeMessage += textValue;
                  console.log("Extracted Text:", textValue); // ✅ 추출된 값 출력
                }
              } catch (error) {
                console.error("JSON parsing error:", error);
              }
            }
          }
        }

        console.log("✅ Streaming complete");
        return completeMessage;
      } catch (error) {
        console.error("Error querying assistant:", error);
        return { error: "검색 요청 실패" };
      }
    },
  },
};

// ✅ 에이전트 리스트에 추가
const agents = injectTransferTools([haiku]);

export default agents;
