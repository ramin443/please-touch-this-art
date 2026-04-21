import { useCallback, useState } from "react";
import { MODELS, type ModelId } from "@/content/models";
import { AudioGuidePicker } from "@/components/audio-guide/AudioGuidePicker";
import { AudioProcessingStage } from "@/components/audio-guide/AudioProcessingStage";
import { AudioPlayer } from "@/components/audio-guide/AudioPlayer";

type Stage =
  | { stage: "picker" }
  | { stage: "processing"; modelId: ModelId }
  | { stage: "player"; modelId: ModelId };

export default function AudioGuide() {
  const [state, setState] = useState<Stage>({ stage: "picker" });

  const handleSelect = useCallback((id: ModelId) => {
    setState({ stage: "processing", modelId: id });
  }, []);

  const handleProcessingDone = useCallback(() => {
    setState((prev) =>
      prev.stage === "processing"
        ? { stage: "player", modelId: prev.modelId }
        : prev
    );
  }, []);

  const handleBack = useCallback(() => {
    setState({ stage: "picker" });
  }, []);

  if (state.stage === "picker") {
    return <AudioGuidePicker onSelect={handleSelect} />;
  }

  const model = MODELS.find((m) => m.id === state.modelId);
  if (!model) return <AudioGuidePicker onSelect={handleSelect} />;

  if (state.stage === "processing") {
    return (
      <AudioProcessingStage
        model={model}
        onDone={handleProcessingDone}
        onBack={handleBack}
      />
    );
  }

  return <AudioPlayer model={model} onBack={handleBack} />;
}
