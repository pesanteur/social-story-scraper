import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { scrapeAPI, exportAPI } from '../services/api';
import {
  ArrowLeft,
  Download,
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Heart,
  Repeat2,
  MessageCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const STATUS_ICONS = {
  pending: Clock,
  running: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
};

type TabType = 'tweets' | 'topics' | 'ideas';

export const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('tweets');

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['scrapeJob', jobId],
    queryFn: () => scrapeAPI.getScrapeJob(jobId!),
    enabled: !!jobId,
  });

  const { data: tweets, isLoading: tweetsLoading } = useQuery({
    queryKey: ['jobTweets', jobId],
    queryFn: () => scrapeAPI.getJobTweets(jobId!),
    enabled: !!jobId && activeTab === 'tweets',
  });

  const { data: topics, isLoading: topicsLoading } = useQuery({
    queryKey: ['jobTopics', jobId],
    queryFn: () => scrapeAPI.getJobTopics(jobId!),
    enabled: !!jobId && activeTab === 'topics',
  });

  const { data: ideas, isLoading: ideasLoading } = useQuery({
    queryKey: ['jobIdeas', jobId],
    queryFn: () => scrapeAPI.getJobIdeas(jobId!),
    enabled: !!jobId && activeTab === 'ideas',
  });

  const handleExport = async (type: 'tweets' | 'topics' | 'ideas') => {
    if (!jobId) return;

    try {
      let blob: Blob;
      let filename: string;

      switch (type) {
        case 'tweets':
          blob = await exportAPI.exportTweets(jobId);
          filename = `tweets_${jobId}.csv`;
          break;
        case 'topics':
          blob = await exportAPI.exportTopics(jobId);
          filename = `topics_${jobId}.csv`;
          break;
        case 'ideas':
          blob = await exportAPI.exportIdeas(jobId);
          filename = `ideas_${jobId}.csv`;
          break;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (jobLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card text-center py-12">
          <p className="text-gray-500">Job not found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[job.status];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>

        <div className="card">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <StatusIcon
                  className={`h-6 w-6 ${
                    job.status === 'running' ? 'animate-spin' : ''
                  } ${
                    job.status === 'completed'
                      ? 'text-green-500'
                      : job.status === 'failed'
                      ? 'text-red-500'
                      : job.status === 'running'
                      ? 'text-blue-500'
                      : 'text-yellow-500'
                  }`}
                />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Scrape Job
                </h1>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`${
                      job.status === 'completed'
                        ? 'text-green-600'
                        : job.status === 'failed'
                        ? 'text-red-600'
                        : job.status === 'running'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    } font-medium`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Started:</span>{' '}
                  {format(new Date(job.created_at), 'PPpp')}
                </div>
                {job.completed_at && (
                  <div>
                    <span className="font-medium">Completed:</span>{' '}
                    {format(new Date(job.completed_at), 'PPpp')}
                  </div>
                )}
                {job.ai_model_used && (
                  <div>
                    <span className="font-medium">AI Model:</span> {job.ai_model_used}
                  </div>
                )}
                {job.error_message && (
                  <div className="text-red-600 mt-2">
                    <span className="font-medium">Error:</span> {job.error_message}
                  </div>
                )}
              </div>

              {job.job_metadata && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {job.job_metadata.tweets_scraped && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {job.job_metadata.tweets_scraped} tweets
                    </span>
                  )}
                  {job.job_metadata.topics_found && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      {job.job_metadata.topics_found} topics
                    </span>
                  )}
                  {job.job_metadata.ideas_generated && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {job.job_metadata.ideas_generated} ideas
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {job.status === 'completed' && (
        <>
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('tweets')}
                  className={`${
                    activeTab === 'tweets'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Tweets
                  {job.job_metadata?.tweets_scraped && (
                    <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                      {job.job_metadata.tweets_scraped}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('topics')}
                  className={`${
                    activeTab === 'topics'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Topics
                  {job.job_metadata?.topics_found && (
                    <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                      {job.job_metadata.topics_found}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('ideas')}
                  className={`${
                    activeTab === 'ideas'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Ideas
                  {job.job_metadata?.ideas_generated && (
                    <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                      {job.job_metadata.ideas_generated}
                    </span>
                  )}
                </button>
              </nav>
            </div>
          </div>

          {/* Export Button */}
          <div className="mb-4">
            <button
              onClick={() => handleExport(activeTab)}
              className="btn-secondary flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Export as CSV
            </button>
          </div>

          {/* Tweets Tab */}
          {activeTab === 'tweets' && (
            <div className="space-y-4">
              {tweetsLoading ? (
                <div className="card">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : tweets && tweets.length > 0 ? (
                tweets.map((tweet) => (
                  <div key={tweet.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {tweet.author_username && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              @{tweet.author_username}
                            </span>
                            {tweet.author_follower_count && (
                              <span className="text-sm text-gray-500">
                                {tweet.author_follower_count.toLocaleString()} followers
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-gray-800 whitespace-pre-wrap">{tweet.text}</p>
                      </div>
                      <a
                        href={tweet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 ml-3"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {tweet.like_count.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat2 className="h-4 w-4" />
                        {tweet.retweet_count.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {tweet.reply_count.toLocaleString()}
                      </div>
                      <div className="ml-auto">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded text-xs">
                          Engagement: {tweet.engagement_score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-500">No tweets found for this job</p>
                </div>
              )}
            </div>
          )}

          {/* Topics Tab */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              {topicsLoading ? (
                <div className="card">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : topics && topics.length > 0 ? (
                topics.map((topic) => (
                  <div key={topic.id} className="card">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-600 text-white font-bold">
                          #{topic.rank}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {topic.title}
                        </h3>
                        <p className="text-gray-700 mb-3">{topic.description}</p>
                        {topic.key_insights && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Key Insights:
                            </h4>
                            <p className="text-sm text-gray-600">{topic.key_insights}</p>
                          </div>
                        )}
                        {topic.visual_analogy && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Visual Analogy:
                            </h4>
                            <p className="text-sm text-gray-600">{topic.visual_analogy}</p>
                          </div>
                        )}
                        {topic.most_benefited_niches && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-1">
                              Best for:
                            </h4>
                            <p className="text-sm text-gray-600">
                              {topic.most_benefited_niches}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-500">No topics found for this job</p>
                </div>
              )}
            </div>
          )}

          {/* Ideas Tab */}
          {activeTab === 'ideas' && (
            <div className="space-y-4">
              {ideasLoading ? (
                <div className="card">
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-48 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : ideas && ideas.length > 0 ? (
                ideas.map((idea) => (
                  <div key={idea.id} className="card">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {idea.title}
                        </h3>
                        <p className="text-gray-700 mb-4">{idea.content_overview}</p>

                        <div className="space-y-3">
                          {idea.target_audience && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Target Audience:
                              </h4>
                              <p className="text-sm text-gray-600">{idea.target_audience}</p>
                            </div>
                          )}
                          {idea.core_pain_point && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Core Pain Point:
                              </h4>
                              <p className="text-sm text-gray-600">{idea.core_pain_point}</p>
                            </div>
                          )}
                          {idea.hook_strategy && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Hook Strategy:
                              </h4>
                              <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                                {JSON.stringify(idea.hook_strategy, null, 2)}
                              </pre>
                            </div>
                          )}
                          {idea.storyline_outline && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">
                                Storyline Outline:
                              </h4>
                              <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                                {JSON.stringify(idea.storyline_outline, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12">
                  <p className="text-gray-500">No content ideas found for this job</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {job.status !== 'completed' && (
        <div className="card text-center py-12">
          <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-spin" />
          <p className="text-gray-500">
            This job is still {job.status}. Results will appear here once complete.
          </p>
        </div>
      )}
    </div>
  );
};
