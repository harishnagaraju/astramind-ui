import { AlignLeft } from 'lucide-react';
import type { ChangeEvent } from 'react';

const PROMPT_MAX_LENGTH = 2_000;

interface PromptEditorProps {
  onChange: (value: string) => void;
  value: string;
}

export function PromptEditor({ onChange, value }: PromptEditorProps): React.ReactElement {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange(event.target.value);
  };

  return (
    <section className="prompt-editor" aria-labelledby="prompt-heading">
      <div className="panel-heading">
        <div>
          <h2 id="prompt-heading">Prompt</h2>
          <p>Describe the visual direction.</p>
        </div>
        <span className="character-count" aria-live="polite">
          {value.length.toLocaleString()} / {PROMPT_MAX_LENGTH.toLocaleString()}
        </span>
      </div>
      <div className="prompt-field">
        <AlignLeft size={17} aria-hidden="true" />
        <textarea
          value={value}
          maxLength={PROMPT_MAX_LENGTH}
          onChange={handleChange}
          placeholder="Describe what you want to create or change…"
          aria-describedby="prompt-helper"
        />
      </div>
      <p className="prompt-helper" id="prompt-helper">
        Be specific about composition, lighting, subject, and style.
      </p>
    </section>
  );
}
