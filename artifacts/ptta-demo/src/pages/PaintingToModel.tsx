import { useCallback, useState } from "react";
import { MODELS, type ModelId } from "@/content/models";
import { ModelPicker } from "@/components/painting-to-model/ModelPicker";
import { ProcessingStage } from "@/components/painting-to-model/ProcessingStage";
import { ViewerStage } from "@/components/painting-to-model/ViewerStage";

type Stage =
  | { stage: "picker" }
  | { stage: "processing"; modelId: ModelId }
  | { stage: "viewer"; modelId: ModelId };

export default function PaintingToModel() {
  const [state, setState] = useState<Stage>({ stage: "picker" });

  const handleSelect = useCallback((id: ModelId) => {
    setState({ stage: "processing", modelId: id });
  }, []);

  const handleProcessingDone = useCallback(() => {
    setState((prev) =>
      prev.stage === "processing"
        ? { stage: "viewer", modelId: prev.modelId }
        : prev
    );
  }, []);

  const handleBack = useCallback(() => {
    setState({ stage: "picker" });
  }, []);

  if (state.stage === "picker") {
    return <ModelPicker onSelect={handleSelect} />;
  }

  const model = MODELS.find((m) => m.id === state.modelId);
  if (!model) {
    return <ModelPicker onSelect={handleSelect} />;
  }

  if (state.stage === "processing") {
    return (
      <ProcessingStage
        model={model}
        onDone={handleProcessingDone}
        onBack={handleBack}
      />
    );
  }

  return <ViewerStage model={model} onBack={handleBack} />;
}
