export interface ComfyUiUploadResponse {
  name: string;
  subfolder: string;
  type: string;
}

export interface ComfyUiQueuePromptResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

export interface ComfyUiObjectInfoCheckpointLoader {
  CheckpointLoaderSimple?: {
    input: {
      required: {
        ckpt_name: [string[], Record<string, unknown>];
      };
    };
  };
}

export interface ComfyUiOutputImageRef {
  filename: string;
  subfolder: string;
  type: string;
}

export interface ComfyUiExecutedOutput {
  images?: ComfyUiOutputImageRef[];
}

export type ComfyUiWebSocketMessage =
  | { type: 'status'; data: Record<string, unknown> }
  | { type: 'progress'; data: { value: number; max: number; prompt_id?: string } }
  | { type: 'executing'; data: { node: string | null; prompt_id: string } }
  | { type: 'executed'; data: { node: string; prompt_id: string; output: ComfyUiExecutedOutput } }
  | { type: 'execution_error'; data: { prompt_id: string; exception_message?: string } }
  | { type: 'execution_cached'; data: { nodes: string[]; prompt_id: string } };
