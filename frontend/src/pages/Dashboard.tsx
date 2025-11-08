import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { scrapeAPI } from '../services/api';
import { Play, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { ScrapeJob } from '../types';
import { format } from 'date-fns';

const STATUS_COLORS = {
  pending: 'badge-warning',
  running: 'badge-info',
  completed: 'badge-success',
  failed: 'badge-error',
};

const STATUS_ICONS = {
  pending: Clock,
  running: RefreshCw,
  completed: CheckCircle,
  failed: XCircle,
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['scrapeJobs'],
    queryFn: () => scrapeAPI.getScrapeJobs(),
  });

  const createJobMutation = useMutation({
    mutationFn: scrapeAPI.createScrapeJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapeJobs'] });
    },
  });

  const handleRunScrape = () => {
    createJobMutation.mutate();
  };

  const handleViewJob = (jobId: string) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your scraping jobs and analyze social stories
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <button
          onClick={handleRunScrape}
          disabled={createJobMutation.isPending}
          className="btn-primary flex items-center"
        >
          {createJobMutation.isPending ? (
            <>
              <RefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
              Starting scrape...
            </>
          ) : (
            <>
              <Play className="-ml-1 mr-2 h-5 w-5" />
              Run New Scrape
            </>
          )}
        </button>
      </div>

      {/* Recent Jobs */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Scrapes</h2>

        {isLoading ? (
          <div className="card">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => {
              const StatusIcon = STATUS_ICONS[job.status];
              return (
                <div
                  key={job.id}
                  onClick={() => handleViewJob(job.id)}
                  className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon
                          className={`h-5 w-5 ${
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
                        <span className={`${STATUS_COLORS[job.status]}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                        {job.ai_model_used && (
                          <span className="text-xs text-gray-500">
                            {job.ai_model_used}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          Started: {format(new Date(job.created_at), 'PPpp')}
                        </div>
                        {job.completed_at && (
                          <div>
                            Completed: {format(new Date(job.completed_at), 'PPpp')}
                          </div>
                        )}
                        {job.error_message && (
                          <div className="text-red-600 mt-2">
                            Error: {job.error_message}
                          </div>
                        )}
                      </div>

                      {job.job_metadata && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          {job.job_metadata.tweets_scraped && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {job.job_metadata.tweets_scraped} tweets
                            </span>
                          )}
                          {job.job_metadata.topics_found && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {job.job_metadata.topics_found} topics
                            </span>
                          )}
                          {job.job_metadata.ideas_generated && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {job.job_metadata.ideas_generated} ideas
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">No scrape jobs yet. Click "Run New Scrape" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
