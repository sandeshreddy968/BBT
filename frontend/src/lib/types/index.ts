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

// Shared free-text classification/assignment fields present across all four ticket types.
export interface TicketClassificationFields {
  category: string | null;
  subcategory: string | null;
  service: string | null;
  business_service: string | null;
  location: string | null;
  department: string | null;
  environment: string | null;
  assignment_group: string | null;
  knowledge_article: string | null;
}

export interface Incident extends TicketClassificationFields {
  id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  contact_type: string | null;
  impact: string | null;
  urgency: string | null;
  hold_reason: string | null;
  ci_id: number | null;
  caller_id: number;
  assigned_to_id: number | null;
  problem_id: number | null;
  change_id: number | null;
  related_incident_id: number | null;
  resolution_notes: string | null;
  resolution_code: string | null;
  resolved_by_id: number | null;
  resolved_at: string | null;
  close_code: string | null;
  closed_by_id: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Problem extends TicketClassificationFields {
  id: number;
  number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  root_cause: string | null;
  workaround: string | null;
  impact: string | null;
  urgency: string | null;
  ci_id: number | null;
  assigned_to_id: number | null;
  created_by_id: number;
  resolution_code: string | null;
  resolved_by_id: number | null;
  resolved_at: string | null;
  close_code: string | null;
  closed_by_id: number | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Change extends TicketClassificationFields {
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
  close_code: string | null;
  closed_by_id: number | null;
  closed_at: string | null;
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

export interface ServiceRequest extends TicketClassificationFields {
  id: number;
  number: string;
  catalog_item_id: number;
  requested_by_id: number;
  status: string;
  notes: string | null;
  fulfilled_by_id: number | null;
  contact_type: string | null;
  ci_id: number | null;
  resolution_code: string | null;
  close_code: string | null;
  closed_by_id: number | null;
  closed_at: string | null;
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

export interface BreakdownItem {
  label: string;
  count: number;
}

export interface DashboardBreakdown {
  incidents_by_status: BreakdownItem[];
  incidents_by_priority: BreakdownItem[];
}

export interface TrendPoint {
  date: string;
  incidents: number;
  requests: number;
  changes: number;
}

export type TicketTypeName = "incident" | "problem" | "change" | "request";

export interface TicketNote {
  id: number;
  ticket_type: TicketTypeName;
  ticket_id: number;
  author_id: number;
  body: string;
  is_customer_visible: boolean;
  created_at: string;
}

export interface ActivityItem {
  type: TicketTypeName;
  number: string;
  title: string;
  status: string;
  updated_at: string;
  url: string;
}
