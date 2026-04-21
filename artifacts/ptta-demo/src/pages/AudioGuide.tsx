import { useCallback, useState } from "react";
import { MODELS, type ModelId } from "@/content/models";
import { AudioGuidePicker } from "@/components/audio-guide/AudioGuidePicker";
import { AudioPlayer } from "@/components/audio-guide/AudioPlayer";

type Stage =
  | { stage: "picker" }
  | { stage: "player"; modelId: ModelId };

export default function AudioGuide() {
  const [state, setState] = useState<Stage>({ stage: "picker" });

  const handleSelect = useCallback((id: ModelId) => {
    setState({ stage: "player", modelId: id });
  }, []);

  const handleBack = useCallback(() => {
    setState({ stage: "picker" });
  }, []);

  if (state.stage === "picker") {
    return <AudioGuidePicker onSelect={handleSelect} />;
  }

  const model = MODELS.find((m) => m.id === state.modelId);
  if (!model) return <AudioGuidePicker onSelect={handleSelect} />;

  return <AudioPlayer model={model} onBack={handleBack} />;
}
