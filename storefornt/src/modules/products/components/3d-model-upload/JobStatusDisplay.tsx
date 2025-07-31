import React from "react"
import { Clock, Loader2, CheckCircle, XCircle } from "lucide-react"
import { JobStatus } from './types'

interface JobStatusDisplayProps {
  jobStatus: JobStatus
}

const JobStatusDisplay: React.FC<JobStatusDisplayProps> = ({ jobStatus }) => {
  const getStatusIcon = () => {
    switch (jobStatus.status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (jobStatus.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'processing':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  if (jobStatus.status === 'idle') return null

  return (
    <div className={`flex items-center gap-2 p-4 border rounded ${getStatusColor()}`}>
      {getStatusIcon()}
      <div className="flex-1">
        <span className="text-sm font-medium">
          {jobStatus.message || `Status: ${jobStatus.status}`}
        </span>
        {jobStatus.progress !== undefined && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${jobStatus.progress}%` }}
              />
            </div>
            <p className="text-xs mt-1">{jobStatus.progress}% complete</p>
          </div>
        )}
        {jobStatus.jobId && (
          <p className="text-xs mt-1 opacity-75">Job ID: {jobStatus.jobId}</p>
        )}
      </div>
    </div>
  )
}

export default JobStatusDisplay