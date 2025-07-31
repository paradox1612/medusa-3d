import React from "react"
import { Button } from "@medusajs/ui"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { ThreeDJob } from './types'
import { StorageUtils } from './storage'

interface JobHistoryProps {
  onViewJob: (job: ThreeDJob) => void
}

const JobHistory: React.FC<JobHistoryProps> = ({ onViewJob }) => {
  const jobHistory = StorageUtils.getJobHistory()

  if (jobHistory.length === 0) {
    return null
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h4 className="text-md font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Jobs
      </h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {jobHistory.slice(0, 5).map((job) => (
          <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <div className="flex items-center gap-2">
              {job.status === 'completed' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : job.status === 'failed' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
              <span className="font-mono text-xs">{job.id.slice(0, 12)}...</span>
              <span className="text-gray-600">
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${
                job.status === 'completed' ? 'bg-green-100 text-green-700' :
                job.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {job.status}
              </span>
              {job.status === 'completed' && job.model_url && (
                <Button
                  variant="secondary"
                  onClick={() => onViewJob(job)}
                  className="text-xs px-2 py-1 h-auto"
                >
                  View
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobHistory