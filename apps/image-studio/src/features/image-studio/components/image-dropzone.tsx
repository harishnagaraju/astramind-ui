import { ImagePlus, Upload } from 'lucide-react';
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';

interface ImageDropzoneProps {
  isBusy: boolean;
  onImageSelected: (file: File) => void;
}

export function ImageDropzone({ isBusy, onImageSelected }: ImageDropzoneProps): React.ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFirstFile = (files: FileList | null): void => {
    const file = files?.item(0);

    if (file !== null && file !== undefined) {
      onImageSelected(file);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    selectFirstFile(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    setIsDragging(false);
    selectFirstFile(event.dataTransfer.files);
  };

  return (
    <button
      className={`image-dropzone${isDragging ? ' is-dragging' : ''}`}
      type="button"
      disabled={isBusy}
      onClick={() => inputRef.current?.click()}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
      />
      <span className="dropzone-icon" aria-hidden="true">
        <ImagePlus size={26} />
      </span>
      <span className="dropzone-title">Drop an image here</span>
      <span className="dropzone-copy">PNG, JPEG, or WebP up to 20 MB</span>
      <span className="browse-action">
        <Upload size={14} aria-hidden="true" />
        Browse image
      </span>
    </button>
  );
}
