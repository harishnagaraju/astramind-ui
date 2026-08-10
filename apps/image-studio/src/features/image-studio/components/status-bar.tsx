import { AlertCircle, CheckCircle2, Circle, Download, LoaderCircle, Upload } from 'lucide-react';
import type { StudioStatus } from '../image-studio-store';

interface StatusBarProps {
  status: StudioStatus;
}

const statusIcon = {
  completed: CheckCircle2,
  downloading: Download,
  error: AlertCircle,
  generating: LoaderCircle,
  ready: Circle,
  uploading: Upload,
} as const;

export function StatusBar({ status }: StatusBarProps): React.ReactElement {
  const Icon = statusIcon[status.kind];

  return (
    <div className={`status-bar status-${status.kind}`} role="status" aria-live="polite">
      <Icon className={status.kind === 'generating' ? 'spin' : undefined} size={16} aria-hidden="true" />
      <span className="status-label">Status</span>
      <span>{status.message}</span>
      {status.kind === 'generating' ? <span className="status-progress">{status.progress}%</span> : null}
    </div>
  );
}
