// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Company Profile Types
export interface CompanyProfile {
  id: number;
  user_id: number;
  company_name: string;
  industry?: string;
  jurisdiction?: string;
  company_size?: string;
  description?: string;
  keywords?: string[];
  trusted_sources?: string[];
  created_at: string;
  updated_at?: string;
}

export interface CompanyProfileCreate {
  company_name: string;
  industry?: string;
  jurisdiction?: string;
  company_size?: string;
  description?: string;
  keywords?: string[];
  trusted_sources?: string[];
}

export interface CompanyProfileUpdate {
  company_name?: string;
  industry?: string;
  jurisdiction?: string;
  company_size?: string;
  description?: string;
  keywords?: string[];
  trusted_sources?: string[];
}

// Report Types
export interface Report {
  id: number;
  user_id: number;
  company_profile_id: number;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  analysis_type: string;
  scope?: string;
  created_at: string;
  completed_at?: string;
}

export interface ReportCreate {
  title: string;
  analysis_type: string;
  scope?: string;
  company_profile_id: number;
}

export interface ReportUpdate {
  title?: string;
  analysis_type?: string;
  scope?: string;
  status?: string;
}

// Regulatory Change Types
export interface RegulatoryChange {
  id: number;
  report_id: number;
  source_url: string;
  title: string;
  summary?: string;
  impact_assessment?: string;
  compliance_requirements?: string;
  implementation_timeline?: string;
  risk_level?: 'low' | 'medium' | 'high' | 'critical';
  confidence_score?: number;
  relevant_sections?: string[];
  affected_areas?: string[];
  action_items?: string[];
  created_at: string;
}

// Analysis Types
export interface AnalysisRequest {
  company_profile_id: number;
  analysis_type?: 'comprehensive' | 'targeted' | 'monitoring';
  scope?: string;
  keywords?: string[];
}

export interface AnalysisProgress {
  report_id: number;
  status: string;
  progress_percentage: number;
  current_stage: string;
  message: string;
}

export interface AnalysisResult {
  report_id: number;
  status: string;
  regulatory_changes: RegulatoryChange[];
  summary: Record<string, any>;
}

// Schedule Types
export interface Schedule {
  id: number;
  user_id: number;
  company_profile_id: number;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  analysis_type: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
  updated_at?: string;
}

export interface ScheduleCreate {
  name: string;
  frequency: string;
  analysis_type: string;
  company_profile_id: number;
}

export interface ScheduleUpdate {
  name?: string;
  frequency?: string;
  analysis_type?: string;
  is_active?: boolean;
}

// Trusted Source Types
export interface TrustedSource {
  id: number;
  name: string;
  url: string;
  source_type?: string;
  jurisdiction?: string;
  reliability_score?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TrustedSourceCreate {
  name: string;
  url: string;
  source_type?: string;
  jurisdiction?: string;
  reliability_score?: number;
}

export interface TrustedSourceUpdate {
  name?: string;
  url?: string;
  source_type?: string;
  jurisdiction?: string;
  reliability_score?: number;
  is_active?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  total_reports: number;
  completed_reports: number;
  completion_rate: number;
  total_regulatory_changes: number;
  risk_level_distribution: Record<string, number>;
  average_confidence_score: number;
  reports_per_day: number;
  changes_per_report: number;
}

// Socket.io Types
export interface SocketEvents {
  analysis_progress: AnalysisProgress;
  new_log_message: {
    message: string;
    level: 'info' | 'warning' | 'error';
    timestamp: string;
  };
  analysis_completed: {
    report_id: number;
    status: string;
    regulatory_changes_count: number;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  full_name?: string;
}

export interface CompanyProfileForm {
  company_name: string;
  industry: string;
  jurisdiction: string;
  company_size: string;
  description: string;
  keywords: string[];
  trusted_sources: string[];
}

export interface AnalysisForm {
  company_profile_id: number;
  analysis_type: 'comprehensive' | 'targeted' | 'monitoring';
  scope: string;
  keywords: string[];
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

// Filter Types
export interface ReportFilters {
  status?: string;
  analysis_type?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

export interface RegulatoryChangeFilters {
  risk_level?: string;
  confidence_min?: number;
  date_range?: {
    start: string;
    end: string;
  };
}
