export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'
export type RoleCategory = 'software_engineering' | 'data' | 'design' | 'product' | 'devops' | 'other'
export type Seniority = 'intern' | 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'director' | 'vp'
export type AtsProvider = 'greenhouse' | 'lever' | 'ashby' | 'workday' | 'other'
export type SalarySource = 'employer' | 'dol_lca' | 'estimated'
export type VisaStatus = 'f1' | 'opt' | 'stem_opt' | 'h1b' | 'h4_ead' | 'green_card' | 'citizen' | 'other'
export type OptStatus = 'pre_opt' | 'on_opt' | 'stem_extension' | 'expired' | 'not_applicable'
export type AlertFrequency = 'instant' | 'daily' | 'weekly'
export type ApplicationResponse = 'no_response' | 'rejected' | 'screen' | 'offer'
export type UserStatus = 'active' | 'inactive' | 'deleted'
export type EducationLevel = 'bachelors' | 'masters' | 'phd' | 'bootcamp' | 'other'

// ─── companies ───────────────────────────────────────────────────────────────

export interface CompanyRow {
  id: string
  name_raw: string
  canonical_name: string
  normalized_name: string
  domain: string | null
  ats_provider: AtsProvider | null
  ats_board_token: string | null
  sponsor_flag: boolean
  sponsor_score: number | null
  role_grades: Json | null
  approval_rate: number | null
  years_sponsoring: number | null
  recent_activity: string | null
  industry: string | null
  company_size: string | null
  headquarters: string | null
  logo_url: string | null
  last_synced_at: string | null
}

export interface CompanyInsert {
  id?: string
  name_raw: string
  canonical_name: string
  normalized_name: string
  domain?: string | null
  ats_provider?: AtsProvider | null
  ats_board_token?: string | null
  sponsor_flag?: boolean
  sponsor_score?: number | null
  role_grades?: Json | null
  approval_rate?: number | null
  years_sponsoring?: number | null
  recent_activity?: string | null
  industry?: string | null
  company_size?: string | null
  headquarters?: string | null
  logo_url?: string | null
  last_synced_at?: string | null
}

export interface CompanyUpdate extends Partial<CompanyInsert> {}

// ─── company_aliases ─────────────────────────────────────────────────────────

export interface CompanyAliasRow {
  id: string
  alias_raw: string
  company_id: string
}

export interface CompanyAliasInsert {
  id?: string
  alias_raw: string
  company_id: string
}

export interface CompanyAliasUpdate extends Partial<CompanyAliasInsert> {}

// ─── job_postings ─────────────────────────────────────────────────────────────

export interface JobPostingRow {
  id: string
  company_id: string
  source_ats: AtsProvider
  source_job_id: string
  title: string
  normalized_title: string | null
  role_category: RoleCategory | null
  seniority: Seniority | null
  description_html: string | null
  locations: string[] | null
  employment_type: EmploymentType | null
  remote: boolean | null
  salary_min: number | null
  salary_max: number | null
  salary_source: SalarySource | null
  posted_at: string | null
  updated_at: string
  source_url: string
  tags: string[] | null
  jsonld: Json | null
  is_active: boolean
}

export interface JobPostingInsert {
  id?: string
  company_id: string
  source_ats: AtsProvider
  source_job_id: string
  title: string
  normalized_title?: string | null
  role_category?: RoleCategory | null
  seniority?: Seniority | null
  description_html?: string | null
  locations?: string[] | null
  employment_type?: EmploymentType | null
  remote?: boolean | null
  salary_min?: number | null
  salary_max?: number | null
  salary_source?: SalarySource | null
  posted_at?: string | null
  updated_at?: string
  source_url: string
  tags?: string[] | null
  jsonld?: Json | null
  is_active?: boolean
}

export interface JobPostingUpdate extends Partial<JobPostingInsert> {}

// ─── uscis_sponsor_records ────────────────────────────────────────────────────

export interface UscisRecordRow {
  id: string
  employer_name_raw: string
  normalized_name: string
  tax_id_last4: string | null
  naics: string | null
  fiscal_year: number
  initial_approvals: number
  initial_denials: number
  continuing_approvals: number
  continuing_denials: number
  city: string | null
  state: string | null
  zip: string | null
  company_id: string | null
}

export interface UscisRecordInsert {
  id?: string
  employer_name_raw: string
  normalized_name: string
  tax_id_last4?: string | null
  naics?: string | null
  fiscal_year: number
  initial_approvals: number
  initial_denials: number
  continuing_approvals: number
  continuing_denials: number
  city?: string | null
  state?: string | null
  zip?: string | null
  company_id?: string | null
}

export interface UscisRecordUpdate extends Partial<UscisRecordInsert> {}

// ─── dol_lca_records ─────────────────────────────────────────────────────────

export interface DolLcaRow {
  id: string
  employer_name_raw: string
  normalized_name: string
  soc_code: string | null
  job_title: string
  worksite_city: string | null
  worksite_state: string | null
  prevailing_wage: number | null
  offered_wage: number | null
  case_status: string | null
  decision_date: string | null
  company_id: string | null
}

export interface DolLcaInsert {
  id?: string
  employer_name_raw: string
  normalized_name: string
  soc_code?: string | null
  job_title: string
  worksite_city?: string | null
  worksite_state?: string | null
  prevailing_wage?: number | null
  offered_wage?: number | null
  case_status?: string | null
  decision_date?: string | null
  company_id?: string | null
}

export interface DolLcaUpdate extends Partial<DolLcaInsert> {}

// ─── users ────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string
  google_sub: string | null
  zolve_user_id: string | null
  name: string | null
  email: string
  mobile: string | null
  status_type: UserStatus
  visa_status: VisaStatus | null
  opt_status: OptStatus | null
  grad_year: number | null
  preferred_role: RoleCategory | null
  resume_url: string | null
  visible_to_employers: boolean
  consent_version: string | null
  consent_at: string | null
  created_at: string
}

export interface UserInsert {
  id?: string
  google_sub?: string | null
  zolve_user_id?: string | null
  name?: string | null
  email: string
  mobile?: string | null
  status_type?: UserStatus
  visa_status?: VisaStatus | null
  opt_status?: OptStatus | null
  grad_year?: number | null
  preferred_role?: RoleCategory | null
  resume_url?: string | null
  visible_to_employers?: boolean
  consent_version?: string | null
  consent_at?: string | null
  created_at?: string
}

export interface UserUpdate extends Partial<UserInsert> {}

// ─── user_education ───────────────────────────────────────────────────────────

export interface UserEducationRow {
  id: string
  user_id: string
  level: EducationLevel
  university: string
  start_date: string | null
  end_date: string | null
}

export interface UserEducationInsert {
  id?: string
  user_id: string
  level: EducationLevel
  university: string
  start_date?: string | null
  end_date?: string | null
}

export interface UserEducationUpdate extends Partial<UserEducationInsert> {}

// ─── user_employment ──────────────────────────────────────────────────────────

export interface UserEmploymentRow {
  id: string
  user_id: string
  company: string
  designation: string
  start_date: string | null
  end_date: string | null
}

export interface UserEmploymentInsert {
  id?: string
  user_id: string
  company: string
  designation: string
  start_date?: string | null
  end_date?: string | null
}

export interface UserEmploymentUpdate extends Partial<UserEmploymentInsert> {}

// ─── user_profile_completion ──────────────────────────────────────────────────

export interface UserProfileCompletionRow {
  user_id: string
  percent: number
  updated_at: string
}

export interface UserProfileCompletionInsert {
  user_id: string
  percent: number
  updated_at?: string
}

export interface UserProfileCompletionUpdate extends Partial<UserProfileCompletionInsert> {}

// ─── saved_jobs ───────────────────────────────────────────────────────────────

export interface SavedJobRow {
  user_id: string
  job_id: string
  saved_at: string
}

export interface SavedJobInsert {
  user_id: string
  job_id: string
  saved_at?: string
}

export interface SavedJobUpdate extends Partial<SavedJobInsert> {}

// ─── job_views ────────────────────────────────────────────────────────────────

export interface JobViewRow {
  id: string
  user_id: string | null
  job_id: string
  viewed_at: string
}

export interface JobViewInsert {
  id?: string
  user_id?: string | null
  job_id: string
  viewed_at?: string
}

export interface JobViewUpdate extends Partial<JobViewInsert> {}

// ─── company_views ────────────────────────────────────────────────────────────

export interface CompanyViewRow {
  id: string
  user_id: string | null
  company_id: string
  viewed_at: string
}

export interface CompanyViewInsert {
  id?: string
  user_id?: string | null
  company_id: string
  viewed_at?: string
}

export interface CompanyViewUpdate extends Partial<CompanyViewInsert> {}

// ─── applications ─────────────────────────────────────────────────────────────

export interface ApplicationRow {
  id: string
  user_id: string
  job_id: string
  clicked_apply_at: string
  response: ApplicationResponse | null
}

export interface ApplicationInsert {
  id?: string
  user_id: string
  job_id: string
  clicked_apply_at?: string
  response?: ApplicationResponse | null
}

export interface ApplicationUpdate extends Partial<ApplicationInsert> {}

// ─── job_alerts ───────────────────────────────────────────────────────────────

export interface JobAlertRow {
  id: string
  user_id: string
  query_json: Json
  frequency: AlertFrequency
}

export interface JobAlertInsert {
  id?: string
  user_id: string
  query_json: Json
  frequency?: AlertFrequency
}

export interface JobAlertUpdate extends Partial<JobAlertInsert> {}

// ─── Database type ────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow
        Insert: CompanyInsert
        Update: CompanyUpdate
      }
      company_aliases: {
        Row: CompanyAliasRow
        Insert: CompanyAliasInsert
        Update: CompanyAliasUpdate
      }
      job_postings: {
        Row: JobPostingRow
        Insert: JobPostingInsert
        Update: JobPostingUpdate
      }
      uscis_sponsor_records: {
        Row: UscisRecordRow
        Insert: UscisRecordInsert
        Update: UscisRecordUpdate
      }
      dol_lca_records: {
        Row: DolLcaRow
        Insert: DolLcaInsert
        Update: DolLcaUpdate
      }
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
      }
      user_education: {
        Row: UserEducationRow
        Insert: UserEducationInsert
        Update: UserEducationUpdate
      }
      user_employment: {
        Row: UserEmploymentRow
        Insert: UserEmploymentInsert
        Update: UserEmploymentUpdate
      }
      user_profile_completion: {
        Row: UserProfileCompletionRow
        Insert: UserProfileCompletionInsert
        Update: UserProfileCompletionUpdate
      }
      saved_jobs: {
        Row: SavedJobRow
        Insert: SavedJobInsert
        Update: SavedJobUpdate
      }
      job_views: {
        Row: JobViewRow
        Insert: JobViewInsert
        Update: JobViewUpdate
      }
      company_views: {
        Row: CompanyViewRow
        Insert: CompanyViewInsert
        Update: CompanyViewUpdate
      }
      applications: {
        Row: ApplicationRow
        Insert: ApplicationInsert
        Update: ApplicationUpdate
      }
      job_alerts: {
        Row: JobAlertRow
        Insert: JobAlertInsert
        Update: JobAlertUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      employment_type: EmploymentType
      role_category: RoleCategory
      seniority: Seniority
      ats_provider: AtsProvider
      salary_source: SalarySource
      visa_status: VisaStatus
      opt_status: OptStatus
      alert_frequency: AlertFrequency
      application_response: ApplicationResponse
      user_status: UserStatus
      education_level: EducationLevel
    }
  }
}
