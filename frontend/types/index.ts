// ─── Enums / Union Types ───────────────────────────────────────────────────────

export type CharacterStatus = "draft" | "active" | "archived";
export type TaskStatus = "queued" | "running" | "done" | "failed" | "cancelled";
export type PublishStatus = "draft" | "approved" | "ready" | "published" | "rejected";
export type PlanStatus = "planned" | "draft" | "ready" | "published" | "skipped";
export type AssetType = "image" | "video";
export type PromptType = "photo" | "reel" | "caption" | "negative";
export type TaskType = "generate_image" | "generate_reel" | "generate_caption" | "upscale" | "edit";
export type Engine = "midjourney" | "dalle" | "stable_diffusion" | "runway" | "kling" | "manual";

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface Character {
  id: number;
  name: string;
  archetype: string;
  age_style?: string;
  nationality_style?: string;
  tone_of_voice?: string;
  bio_short?: string;
  bio_full?: string;
  core_traits?: string;
  forbidden_traits?: string;
  style_notes?: string;
  status: CharacterStatus;
  created_at: string;
  updated_at: string;
}

export interface ConsistencyProfile {
  id: number;
  character_id: number;
  face_prompt: string;
  body_prompt: string;
  outfit_default: string;
  lighting_style: string;
  color_palette: string;
  camera_style: string;
  negative_prompt: string;
  midjourney_sref_url?: string;
  midjourney_cref_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferenceAsset {
  id: number;
  character_id: number;
  character_name?: string;
  file_path: string;
  file_url?: string;
  asset_type: AssetType;
  category: string;
  is_master: boolean;
  rating?: number;
  notes?: string;
  created_at: string;
}

export interface PromptTemplate {
  id: number;
  character_id?: number;
  character_name?: string;
  title: string;
  prompt_type: PromptType;
  category: string;
  prompt_text: string;
  negative_prompt?: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerationTask {
  id: number;
  character_id?: number;
  character_name?: string;
  title: string;
  task_type: TaskType;
  engine: Engine;
  description?: string;
  prompt_template_id?: number;
  prompt_template_title?: string;
  result_count_expected: number;
  result_count_actual: number;
  status: TaskStatus;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaAsset {
  id: number;
  character_id?: number;
  character_name?: string;
  task_id?: number;
  file_path: string;
  file_url?: string;
  asset_type: AssetType;
  quality_score?: number;
  consistency_score?: number;
  is_best: boolean;
  publish_status: PublishStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPlanItem {
  id: number;
  character_id?: number;
  character_name?: string;
  media_asset_id?: number;
  title: string;
  platform: string;
  caption?: string;
  hashtags?: string;
  scheduled_date?: string;
  status: PlanStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface DashboardStats {
  total_characters: number;
  active_characters: number;
  pending_tasks: number;
  total_media: number;
  upcoming_content: number;
  recent_characters: Character[];
  recent_tasks: GenerationTask[];
  upcoming_plan_items: ContentPlanItem[];
}

export interface ApiError {
  detail: string;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CharacterFormData {
  name: string;
  archetype: string;
  age_style: string;
  nationality_style: string;
  tone_of_voice: string;
  bio_short: string;
  bio_full: string;
  core_traits: string;
  forbidden_traits: string;
  style_notes: string;
  status: CharacterStatus;
}

export interface PromptFormData {
  character_id?: number;
  title: string;
  prompt_type: PromptType;
  category: string;
  prompt_text: string;
  negative_prompt: string;
  notes: string;
  is_favorite: boolean;
}

export interface TaskFormData {
  character_id?: number;
  title: string;
  task_type: TaskType;
  engine: Engine;
  description: string;
  prompt_template_id?: number;
  result_count_expected: number;
  status: TaskStatus;
}

export interface PlanItemFormData {
  character_id?: number;
  media_asset_id?: number;
  title: string;
  platform: string;
  caption: string;
  hashtags: string;
  scheduled_date: string;
  status: PlanStatus;
  notes: string;
}
