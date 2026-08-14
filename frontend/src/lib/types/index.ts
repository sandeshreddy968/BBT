export type Role = "admin" | "user";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface CI {
  id: number;
  name: string;
  ci_type: string;
  status: string;
  serial_number: string | null;
  location: string | null;
  owner_id: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string | null;
  ci_id: number | null;
  caller_id: number;
  assigned_to_id: number | null;
  problem_id: number | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Problem {
  id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  root_cause: string | null;
  workaround: string | null;
  ci_id: number | null;
  assigned_to_id: number | null;
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

export interface Change {
  id: number;
  number: string;
  title: string;
  description: string;
  change_type: string;
  status: string;
  risk: string;
  ci_id: number | null;
  problem_id: number | null;
  requested_by_id: number;
  approved_by_id: number | null;
  planned_start: string | null;
  planned_end: string | null;
  implementation_plan: string | null;
  backout_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: number;
  number: string;
  catalog_item_id: number;
  requested_by_id: number;
  status: string;
  notes: string | null;
  fulfilled_by_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: string | null;
  status: string;
  author_id: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export interface DashboardSummary {
  open_incidents: number;
  my_incidents: number;
  open_problems: number;
  open_changes: number;
  pending_requests: number;
  total_cis: number;
  published_articles: number;
}
