import { Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { getComfyUiConnector } from './comfyui-client';
import { GenerationControls } from './components/generation-controls';
import { ImageDropzone } from './components/image-dropzone';
import { ImagePreviewPanel } from './components/image-preview-panel';
import { PromptEditor } from './components/prompt-editor';
import { StatusBar } from './components/status-bar';
import { prepareImageInput } from './image-input';
import { useImageStudioStore } from './image-studio-store';

export function ImageStudioPage(): React.ReactElement {
  const inputImage = useImageStudioStore((state) => state.inputImage);
  const outputImage = useImageStudioStore((state) => state.outputImage);
  const prompt = useImageStudioStore((state) => state.prompt);
  const status = useImageStudioStore((state) => state.status);
  const setInputImage = useImageStudioStore((state) => state.setInputImage);
  const clearInputImage = useImageStudioStore((state) => state.clearInputImage);
  const setOutputImage = useImageStudioStore((state) => state.setOutputImage);
  const setPrompt = useImageStudioStore((state) => state.setPrompt);
  const setStatus = useImageStudioStore((state) => state.setStatus);
  const previousPreviewUrl = useRef<string | null>(null);

  useEffect(() => {
    const nextPreviewUrl = inputImage?.previewUrl ?? null;

    if (previousPreviewUrl.current !== null && previousPreviewUrl.current !== nextPreviewUrl) {
      URL.revokeObjectURL(previousPreviewUrl.current);
    }

    previousPreviewUrl.current = nextPreviewUrl;
  }, [inputImage]);

  useEffect(
    () => () => {
      if (previousPreviewUrl.current !== null) {
        URL.revokeObjectURL(previousPreviewUrl.current);
      }
    },
    [],
  );

  const handleImageSelected = (file: File): void => {
    const result = prepareImageInput(file);

    if (result.ok) {
      setInputImage(result.value);
      setStatus({ kind: 'ready', message: 'Ready' });
      return;
    }

    setStatus({ kind: 'error', message: result.error });
  };

  const handleGenerate = (): void => {
    if (inputImage === null || prompt.trim().length === 0) {
      return;
    }

    setStatus({ kind: 'generating', message: 'Starting generation…', progress: 0 });

    void (async () => {
      try {
        const connector = getComfyUiConnector();
        const result = await connector.generate({ inputImageFile: inputImage.file, prompt }, (progress) => {
          setStatus({ kind: 'generating', message: progress.message, progress: progress.percent });
        });

        setOutputImage(result);
        setStatus({ kind: 'completed', message: 'Generation complete.' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Image generation failed.';
        setStatus({ kind: 'error', message });
      }
    })();
  };

  return (
    <section className="studio-page" aria-labelledby="studio-heading">
      <div className="studio-intro">
        <div>
          <p className="eyebrow">Creative workspace</p>
          <h1 id="studio-heading">Image Studio</h1>
          <p className="page-description">
            Use a reference image and a prompt to shape your next visual direction.
          </p>
        </div>
        <div className="studio-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>Image workflow</span>
        </div>
      </div>

      <div className="image-workspace">
        <div className="preview-grid">
          <ImagePreviewPanel
            title="Input image"
            description="Reference"
            kind="input"
            image={inputImage}
            emptyState={
              <ImageDropzone onImageSelected={handleImageSelected} isBusy={status.kind === 'uploading'} />
            }
            onClear={clearInputImage}
          />
          <ImagePreviewPanel
            title="Output image"
            description="Generated result"
            kind="output"
            image={outputImage}
            emptyState={<OutputEmptyState />}
          />
        </div>

        <PromptEditor value={prompt} onChange={setPrompt} />
        <GenerationControls
          canGenerate={inputImage !== null}
          isGenerating={status.kind === 'generating'}
          onGenerate={handleGenerate}
        />
      </div>

      <StatusBar status={status} />
    </section>
  );
}

function OutputEmptyState(): React.ReactElement {
  return (
    <div className="output-empty-state">
      <Sparkles size={26} aria-hidden="true" />
      <p>Generated results appear here.</p>
    </div>
  );
}
