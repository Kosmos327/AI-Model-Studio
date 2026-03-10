import type {
  Character,
  CharacterFormData,
  ConsistencyProfile,
  ReferenceAsset,
  PromptTemplate,
  PromptFormData,
  GenerationTask,
  TaskFormData,
  MediaAsset,
  ContentPlanItem,
  PlanItemFormData,
  PaginatedResponse,
  DashboardStats,
  TaskStatus,
  PublishStatus,
} from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = (): Promise<DashboardStats> =>
  request("/api/dashboard");

// ─── Characters ───────────────────────────────────────────────────────────────

export const getCharacters = (params?: {
  page?: number;
  size?: number;
  status?: string;
  search?: string;
}): Promise<PaginatedResponse<Character>> => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.size) q.set("size", String(params.size));
  if (params?.status) q.set("status", params.status);
  if (params?.search) q.set("search", params.search);
  return request(`/api/characters?${q}`);
};

export const getCharacter = (id: number): Promise<Character> =>
  request(`/api/characters/${id}`);

export const createCharacter = (data: CharacterFormData): Promise<Character> =>
  request("/api/characters", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCharacter = (
  id: number,
  data: Partial<CharacterFormData>
): Promise<Character> =>
  request(`/api/characters/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteCharacter = (id: number): Promise<void> =>
  request(`/api/characters/${id}`, { method: "DELETE" });

// ─── Consistency Profiles ─────────────────────────────────────────────────────

export const getConsistencyProfile = (
  characterId: number
): Promise<ConsistencyProfile> =>
  request(`/api/characters/${characterId}/consistency-profile`);

export const upsertConsistencyProfile = (
  characterId: number,
  data: Partial<ConsistencyProfile>
): Promise<ConsistencyProfile> =>
  request(`/api/characters/${characterId}/consistency-profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// ─── References ───────────────────────────────────────────────────────────────

export const getReferences = (params?: {
  page?: number;
  size?: number;
  character_id?: number;
  asset_type?: string;
  category?: string;
  is_master?: boolean;
}): Promise<PaginatedResponse<ReferenceAsset>> => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.size) q.set("size", String(params.size));
  if (params?.character_id) q.set("character_id", String(params.character_id));
  if (params?.asset_type) q.set("asset_type", params.asset_type);
  if (params?.category) q.set("category", params.category);
  if (params?.is_master !== undefined)
    q.set("is_master", String(params.is_master));
  return request(`/api/references?${q}`);
};

export const uploadReference = (formData: FormData): Promise<ReferenceAsset> =>
  fetch(`${BASE_URL}/api/references/upload`, {
    method: "POST",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Upload failed");
    }
    return res.json();
  });

export const updateReference = (
  id: number,
  data: Partial<ReferenceAsset>
): Promise<ReferenceAsset> =>
  request(`/api/references/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteReference = (id: number): Promise<void> =>
  request(`/api/references/${id}`, { method: "DELETE" });

// ─── Prompts ──────────────────────────────────────────────────────────────────

export const getPrompts = (params?: {
  page?: number;
  size?: number;
  character_id?: number;
  prompt_type?: string;
  category?: string;
  is_favorite?: boolean;
}): Promise<PaginatedResponse<PromptTemplate>> => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.size) q.set("size", String(params.size));
  if (params?.character_id)
    q.set("character_id", String(params.character_id));
  if (params?.prompt_type) q.set("prompt_type", params.prompt_type);
  if (params?.category) q.set("category", params.category);
  if (params?.is_favorite !== undefined)
    q.set("is_favorite", String(params.is_favorite));
  return request(`/api/prompts?${q}`);
};

export const createPrompt = (
  data: PromptFormData
): Promise<PromptTemplate> =>
  request("/api/prompts", { method: "POST", body: JSON.stringify(data) });

export const updatePrompt = (
  id: number,
  data: Partial<PromptFormData>
): Promise<PromptTemplate> =>
  request(`/api/prompts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletePrompt = (id: number): Promise<void> =>
  request(`/api/prompts/${id}`, { method: "DELETE" });

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const getTasks = (params?: {
  page?: number;
  size?: number;
  character_id?: number;
  status?: string;
  engine?: string;
}): Promise<PaginatedResponse<GenerationTask>> => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.size) q.set("size", String(params.size));
  if (params?.character_id)
    q.set("character_id", String(params.character_id));
  if (params?.status) q.set("status", params.status);
  if (params?.engine) q.set("engine", params.engine);
  return request(`/api/tasks?${q}`);
};

export const createTask = (
  data: TaskFormData
): Promise<GenerationTask> =>
  request("/api/tasks", { method: "POST", body: JSON.stringify(data) });

export const updateTaskStatus = (
  id: number,
  status: TaskStatus
): Promise<GenerationTask> =>
  request(`/api/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteTask = (id: number): Promise<void> =>
  request(`/api/tasks/${id}`, { method: "DELETE" });

// ─── Media ────────────────────────────────────────────────────────────────────

export const getMediaAssets = (params?: {
  page?: number;
  size?: number;
  character_id?: number;
  asset_type?: string;
  publish_status?: string;
  is_best?: boolean;
}): Promise<PaginatedResponse<MediaAsset>> => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.size) q.set("size", String(params.size));
  if (params?.character_id)
    q.set("character_id", String(params.character_id));
  if (params?.asset_type) q.set("asset_type", params.asset_type);
  if (params?.publish_status)
    q.set("publish_status", params.publish_status);
  if (params?.is_best !== undefined)
    q.set("is_best", String(params.is_best));
  return request(`/api/media?${q}`);
};

export const uploadMediaAsset = (formData: FormData): Promise<MediaAsset> =>
  fetch(`${BASE_URL}/api/media/upload`, {
    method: "POST",
    body: formData,
  }).then(async (res) => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail ?? "Upload failed");
    }
    return res.json();
  });

export const updateMediaAsset = (
  id: number,
  data: Partial<MediaAsset>
): Promise<MediaAsset> =>
  request(`/api/media/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const updateMediaStatus = (
  id: number,
  publish_status: PublishStatus
): Promise<MediaAsset> =>
  request(`/api/media/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ publish_status }),
  });

export const deleteMediaAsset = (id: number): Promise<void> =>
  request(`/api/media/${id}`, { method: "DELETE" });

// ─── Content Plan ─────────────────────────────────────────────────────────────

export const getPlanItems = (params?: {
  page?: number;
  size?: number;
  character_id?: number;
  status?: string;
  from_date?: string;
  to_date?: string;
}): Promise<PaginatedResponse<ContentPlanItem>> => {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.size) q.set("size", String(params.size));
  if (params?.character_id)
    q.set("character_id", String(params.character_id));
  if (params?.status) q.set("status", params.status);
  if (params?.from_date) q.set("from_date", params.from_date);
  if (params?.to_date) q.set("to_date", params.to_date);
  return request(`/api/planner?${q}`);
};

export const createPlanItem = (
  data: PlanItemFormData
): Promise<ContentPlanItem> =>
  request("/api/planner", { method: "POST", body: JSON.stringify(data) });

export const updatePlanItem = (
  id: number,
  data: Partial<PlanItemFormData>
): Promise<ContentPlanItem> =>
  request(`/api/planner/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletePlanItem = (id: number): Promise<void> =>
  request(`/api/planner/${id}`, { method: "DELETE" });
