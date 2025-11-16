export interface User {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface APIKey {
  id: string;
  service_name: 'apify' | 'openai' | 'anthropic' | 'google_ai' | 'perplexity' | 'telegram' | 'notion';
  is_active: boolean;
  created_at: string;
}

export interface APIKeyCreate {
  service_name: string;
  api_key: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  ai_model_provider: 'openai' | 'anthropic' | 'google';
  ai_model_name: string;
  daily_run_time: string;
  timezone: string;
  auto_run_enabled: boolean;
  twitter_list_url: string | null;
  max_tweets_to_scrape: string;
  apify_actor_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface UserPreferencesUpdate {
  ai_model_provider?: 'openai' | 'anthropic' | 'google';
  ai_model_name?: string;
  daily_run_time?: string;
  timezone?: string;
  auto_run_enabled?: boolean;
  twitter_list_url?: string;
  max_tweets_to_scrape?: string;
  apify_actor_id?: string;
}

export interface ScrapeJob {
  id: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  trigger_type: 'manual' | 'scheduled';
  ai_model_used: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  job_metadata: Record<string, any> | null;
  created_at: string;
}

export interface Tweet {
  id: string;
  scrape_job_id: string;
  tweet_id: string;
  text: string;
  url: string;
  author_username: string | null;
  author_follower_count: number | null;
  like_count: number;
  retweet_count: number;
  reply_count: number;
  engagement_score: number;
  created_at: string;
}

export interface TrendingTopic {
  id: string;
  scrape_job_id: string;
  rank: number;
  title: string;
  description: string;
  key_insights: string | null;
  visual_analogy: string | null;
  most_benefited_niches: string | null;
  created_at: string;
}

export interface ContentIdea {
  id: string;
  scrape_job_id: string;
  title: string;
  content_overview: string;
  target_audience: string | null;
  core_pain_point: string | null;
  hook_strategy: Record<string, any> | null;
  storyline_outline: Record<string, any> | null;
  created_at: string;
}
