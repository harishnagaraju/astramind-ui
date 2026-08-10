import { LoaderCircle, Sparkles } from 'lucide-react';

interface GenerationControlsProps {
  canGenerate: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function GenerationControls({
  canGenerate,
  isGenerating,
  onGenerate,
}: GenerationControlsProps): React.ReactElement {
  return (
    <div className="generation-controls">
      <button
        className="generate-button"
        type="button"
        disabled={!canGenerate || isGenerating}
        onClick={onGenerate}
      >
        {isGenerating ? (
          <LoaderCircle className="spin" size={18} aria-hidden="true" />
        ) : (
          <Sparkles size={18} aria-hidden="true" />
        )}
        {isGenerating ? 'Generating image' : 'Generate image'}
      </button>
      {isGenerating ? <div className="generation-progress" aria-label="Generation progress" /> : null}
    </div>
  );
}
