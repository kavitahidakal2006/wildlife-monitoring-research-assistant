import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  EyeOff,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import { ProcessingStatus, VerificationStatus } from '../types';

interface StatusBadgeProps {
  status: VerificationStatus | ProcessingStatus | 'High Confidence' | 'Requires Review';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case 'Verified':
    case 'High Confidence':
    case 'completed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#244B35]/10 px-2 py-0.5 text-xs font-medium text-[#244B35] whitespace-nowrap">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{status === 'completed' ? 'Completed' : status}</span>
        </span>
      );
    case 'Corrected':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#547A50]/12 px-2 py-0.5 text-xs font-medium text-[#3D5E3A] whitespace-nowrap">
          <Edit3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Corrected</span>
        </span>
      );
    case 'Needs Review':
    case 'Requires Review':
    case 'processing':
    case 'queued':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#D99A3B]/14 px-2 py-0.5 text-xs font-medium text-[#9A6614] whitespace-nowrap">
          {status === 'processing' || status === 'queued' ? (
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
          <span>
            {status === 'processing'
              ? 'Processing'
              : status === 'queued'
                ? 'Queued'
                : status}
          </span>
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#C65B4B]/12 px-2 py-0.5 text-xs font-medium text-[#A33E30] whitespace-nowrap">
          <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Failed</span>
        </span>
      );
    case 'Empty Frame':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#788078]/12 px-2 py-0.5 text-xs font-medium text-[#4F574F] whitespace-nowrap">
          <EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Empty Frame</span>
        </span>
      );
    case 'Unidentifiable':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#788078]/12 px-2 py-0.5 text-xs font-medium text-[#4F574F] whitespace-nowrap">
          <HelpCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{status}</span>
        </span>
      );
  }
}
