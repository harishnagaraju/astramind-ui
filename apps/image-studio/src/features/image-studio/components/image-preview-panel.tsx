import { Download, Maximize2, Scan, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import { IconButton } from '../../../components/ui/icon-button';
import type { InputImage } from '../image-studio-store';

interface ImagePreviewPanelProps {
  description: string;
  emptyState: ReactNode;
  image: InputImage | null;
  kind: 'input' | 'output';
  onClear?: () => void;
  title: string;
}

export function ImagePreviewPanel({
  description,
  emptyState,
  image,
  kind,
  onClear,
  title,
}: ImagePreviewPanelProps): React.ReactElement {
  const hasImage = image !== null;

  return (
    <section className="preview-panel" aria-label={title}>
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <div className="panel-actions">
          {kind === 'input' && hasImage && onClear !== undefined ? (
            <IconButton label="Remove input image" onClick={onClear}>
              <Trash2 size={16} aria-hidden="true" />
            </IconButton>
          ) : null}
          {kind === 'output' ? (
            <>
              <IconButton label="View output at full size" disabled={!hasImage}>
                <Maximize2 size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Fit output image" disabled={!hasImage}>
                <Scan size={16} aria-hidden="true" />
              </IconButton>
              <IconButton label="Save generated image" disabled={!hasImage}>
                <Download size={16} aria-hidden="true" />
              </IconButton>
            </>
          ) : null}
        </div>
      </div>
      <div className="preview-stage">
        {hasImage ? (
          <>
            <img src={image.previewUrl} alt={image.name} />
            <span className="image-name" title={image.name}>
              {image.name}
            </span>
          </>
        ) : (
          emptyState
        )}
      </div>
    </section>
  );
}
