import { Sparkles } from 'lucide-react';

export function ImageStudioPage(): React.ReactElement {
  return (
    <section className="studio-page" aria-labelledby="studio-heading">
      <div className="studio-intro">
        <div>
          <p className="eyebrow">Creative workspace</p>
          <h1 id="studio-heading">Image Studio</h1>
          <p className="page-description">
            Transform reference images with a focused, provider-independent creative workflow.
          </p>
        </div>
        <div className="studio-badge">
          <Sparkles size={16} aria-hidden="true" />
          <span>Image workflow</span>
        </div>
      </div>

      <div className="studio-canvas" aria-label="Image studio workspace" />
    </section>
  );
}
