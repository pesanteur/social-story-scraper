import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsAPI } from '../services/api';
import { Key, Settings as SettingsIcon, Save, Trash2, Plus, Loader2 } from 'lucide-react';
import type { APIKeyCreate, UserPreferencesUpdate } from '../types';

const SERVICE_LABELS: Record<string, string> = {
  apify: 'Apify (Twitter Scraper)',
  openai: 'OpenAI',
  anthropic: 'Anthropic (Claude)',
  google_ai: 'Google AI (Gemini)',
  perplexity: 'Perplexity AI',
  telegram: 'Telegram Bot',
  notion: 'Notion (Optional)',
};

const AI_MODELS: Record<string, { label: string; models: string[] }> = {
  openai: {
    label: 'OpenAI',
    models: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
  },
  anthropic: {
    label: 'Anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-sonnet-4-5-20250929'],
  },
  google: {
    label: 'Google',
    models: ['gemini-pro', 'gemini-2.0-flash-exp'],
  },
};

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'api-keys' | 'preferences'>('api-keys');
  const [newKeyService, setNewKeyService] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);

  // API Keys
  const { data: apiKeys, isLoading: keysLoading } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: () => settingsAPI.getAPIKeys(),
  });

  const createKeyMutation = useMutation({
    mutationFn: (data: APIKeyCreate) => settingsAPI.createAPIKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setShowNewKeyForm(false);
      setNewKeyService('');
      setNewKeyValue('');
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (serviceName: string) => settingsAPI.deleteAPIKey(serviceName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
  });

  // Preferences
  const { data: preferences, isLoading: prefsLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => settingsAPI.getPreferences(),
  });

  const [prefsForm, setPrefsForm] = useState<UserPreferencesUpdate>({});

  React.useEffect(() => {
    if (preferences) {
      setPrefsForm({
        ai_model_provider: preferences.ai_model_provider,
        ai_model_name: preferences.ai_model_name,
        daily_run_time: preferences.daily_run_time,
        timezone: preferences.timezone,
        auto_run_enabled: preferences.auto_run_enabled,
        twitter_list_url: preferences.twitter_list_url || '',
        max_tweets_to_scrape: preferences.max_tweets_to_scrape,
      });
    }
  }, [preferences]);

  const updatePrefsMutation = useMutation({
    mutationFn: (data: UserPreferencesUpdate) => settingsAPI.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });

  const handleAddKey = () => {
    if (newKeyService && newKeyValue) {
      createKeyMutation.mutate({
        service_name: newKeyService,
        api_key: newKeyValue,
      });
    }
  };

  const handleDeleteKey = (serviceName: string) => {
    if (confirm(`Are you sure you want to delete the ${SERVICE_LABELS[serviceName]} API key?`)) {
      deleteKeyMutation.mutate(serviceName);
    }
  };

  const handleSavePreferences = () => {
    updatePrefsMutation.mutate(prefsForm);
  };

  const existingServices = new Set<string>(apiKeys?.map(k => k.service_name) || []);
  const availableServices = Object.keys(SERVICE_LABELS).filter(s => !existingServices.has(s));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your API keys and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`${
                activeTab === 'api-keys'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Key className="h-5 w-5 mr-2" />
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`${
                activeTab === 'preferences'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <SettingsIcon className="h-5 w-5 mr-2" />
              Preferences
            </button>
          </nav>
        </div>
      </div>

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          {/* Add Key Button */}
          {availableServices.length > 0 && !showNewKeyForm && (
            <button
              onClick={() => setShowNewKeyForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add API Key
            </button>
          )}

          {/* New Key Form */}
          {showNewKeyForm && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Add New API Key</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <select
                    value={newKeyService}
                    onChange={(e) => setNewKeyService(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a service...</option>
                    {availableServices.map((service) => (
                      <option key={service} value={service}>
                        {SERVICE_LABELS[service]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    className="input"
                    placeholder="Enter your API key..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddKey}
                    disabled={!newKeyService || !newKeyValue || createKeyMutation.isPending}
                    className="btn-primary"
                  >
                    {createKeyMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Key'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowNewKeyForm(false);
                      setNewKeyService('');
                      setNewKeyValue('');
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Keys */}
          {keysLoading ? (
            <div className="card">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : apiKeys && apiKeys.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {SERVICE_LABELS[key.service_name] || key.service_name}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Added {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`${
                          key.is_active ? 'badge-success' : 'badge-error'
                        }`}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleDeleteKey(key.service_name)}
                        disabled={deleteKeyMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                No API keys configured yet. Add your first key to get started!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {prefsLoading ? (
            <div className="card">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="space-y-6">
                {/* AI Model Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model Provider
                  </label>
                  <select
                    value={prefsForm.ai_model_provider || 'openai'}
                    onChange={(e) =>
                      setPrefsForm({
                        ...prefsForm,
                        ai_model_provider: e.target.value as 'openai' | 'anthropic' | 'google',
                        ai_model_name: AI_MODELS[e.target.value].models[0],
                      })
                    }
                    className="input"
                  >
                    {Object.entries(AI_MODELS).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* AI Model Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Model
                  </label>
                  <select
                    value={prefsForm.ai_model_name || ''}
                    onChange={(e) =>
                      setPrefsForm({ ...prefsForm, ai_model_name: e.target.value })
                    }
                    className="input"
                  >
                    {prefsForm.ai_model_provider &&
                      AI_MODELS[prefsForm.ai_model_provider].models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Twitter List URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter/X List URL
                  </label>
                  <input
                    type="url"
                    value={prefsForm.twitter_list_url || ''}
                    onChange={(e) =>
                      setPrefsForm({ ...prefsForm, twitter_list_url: e.target.value })
                    }
                    className="input"
                    placeholder="https://twitter.com/i/lists/..."
                  />
                </div>

                {/* Max Tweets */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Tweets to Scrape
                  </label>
                  <input
                    type="number"
                    value={prefsForm.max_tweets_to_scrape || '100'}
                    onChange={(e) =>
                      setPrefsForm({ ...prefsForm, max_tweets_to_scrape: e.target.value })
                    }
                    className="input"
                    min="10"
                    max="500"
                  />
                </div>

                {/* Auto Run Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Enable Daily Auto-Run
                    </label>
                    <p className="text-sm text-gray-500">
                      Automatically run scraper at scheduled time
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setPrefsForm({
                        ...prefsForm,
                        auto_run_enabled: !prefsForm.auto_run_enabled,
                      })
                    }
                    className={`${
                      prefsForm.auto_run_enabled ? 'bg-primary-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span
                      className={`${
                        prefsForm.auto_run_enabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                </div>

                {/* Daily Run Time */}
                {prefsForm.auto_run_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Daily Run Time
                    </label>
                    <input
                      type="time"
                      value={prefsForm.daily_run_time || '06:45'}
                      onChange={(e) =>
                        setPrefsForm({ ...prefsForm, daily_run_time: e.target.value })
                      }
                      className="input"
                    />
                  </div>
                )}

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={prefsForm.timezone || 'America/New_York'}
                    onChange={(e) =>
                      setPrefsForm({ ...prefsForm, timezone: e.target.value })
                    }
                    className="input"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSavePreferences}
                    disabled={updatePrefsMutation.isPending}
                    className="btn-primary flex items-center"
                  >
                    {updatePrefsMutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </button>
                  {updatePrefsMutation.isSuccess && (
                    <p className="text-sm text-green-600 mt-2">
                      Preferences saved successfully!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
