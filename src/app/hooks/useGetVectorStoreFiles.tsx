import { useQuery } from "@tanstack/react-query";

import axiosInstance from "../api/axiosInstance";

interface ReqGetVectorStoreFiles {
  vectorStoreId: string;
  lastFileId?: string;
}

export interface ResGetVectorStoreFileType {
  id: string;
  object: string;
  created_at: number;
  vector_store_id?: string;
  filename: string;
}

export interface ResGetVectorStoreFiles {
  data: ResGetVectorStoreFileType[];
  namedFileList: ResGetVectorStoreFileType[];
  first_id: string;
  last_id: string;
  has_more: boolean;
}

const getFileDetails = async (fileId: string) => {
  try {
    const { data } = await axiosInstance.get(`/openai/files/${fileId}`);

    return data;
  } catch (err) {
    console.error("Failed to get file details:", err);
    return null;
  }
};

const getVectorStoreFiles = async ({
  //   vectorStoreId,
  lastFileId,
}: ReqGetVectorStoreFiles) => {
  try {
    // 파일 리스트 가져오기
    const { data } = await axiosInstance.get(
      `openai/vector_stores/vs_iXNcdI7FuMFxrRT5GEWstNDu/files?limit=10${lastFileId ? `&after=${lastFileId}` : ""}`
    );

    const fileList = data;

    // 파일 리스트에 있는 각 파일의 상세 정보(파일 이름 포함) 가져오기
    const filesWithDetails = await Promise.all(
      fileList.data.map(async (file: { id: string }) => {
        const fileDetails = await getFileDetails(file.id);
        return fileDetails
          ? {
              ...file,
              filename: fileDetails.filename ?? "Unknown",
            }
          : null; // 파일이 삭제되었거나 정보가 없으면 null로 처리
      })
    );

    // null 값을 필터링해서 제거
    return {
      namedFileList: filesWithDetails.filter((file) => file !== null),
      ...data,
    };
  } catch (err) {
    console.error("Error fetching vector store files:", err);
    throw err;
  }
};

export const useGetVectorStoreFiles = ({
  vectorStoreId,
  lastFileId,
}: ReqGetVectorStoreFiles) => {
  return useQuery<ResGetVectorStoreFiles>({
    queryKey: [vectorStoreId, "VECTOR_STORE_FILES", lastFileId],
    queryFn: () => getVectorStoreFiles({ vectorStoreId, lastFileId }),
    enabled: !!vectorStoreId,
  });
};
