import { useCallback, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { MODELS, type ModelId } from "@/content/models";
import { FabricationPicker } from "@/components/fabrication/FabricationPicker";
import { DispatchStage } from "@/components/fabrication/DispatchStage";
import { FabricateStage } from "@/components/fabrication/FabricateStage";
import { PolishStage } from "@/components/fabrication/PolishStage";
import { RevealStage } from "@/components/fabrication/RevealStage";

type Stage =
  | { stage: "picker" }
  | { stage: "dispatch"; modelId: ModelId }
  | { stage: "fabricate"; modelId: ModelId }
  | { stage: "polish"; modelId: ModelId }
  | { stage: "reveal"; modelId: ModelId };

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25 },
} as const;

export default function Fabrication() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<Stage>({ stage: "picker" });

  const handleSelect = useCallback((id: ModelId) => {
    setState({ stage: "dispatch", modelId: id });
  }, []);

  const toFabricate = useCallback(() => {
    setState((prev) =>
      prev.stage === "dispatch"
        ? { stage: "fabricate", modelId: prev.modelId }
        : prev
    );
  }, []);

  const toPolish = useCallback(() => {
    setState((prev) =>
      prev.stage === "fabricate"
        ? { stage: "polish", modelId: prev.modelId }
        : prev
    );
  }, []);

  const toReveal = useCallback(() => {
    setState((prev) =>
      prev.stage === "polish"
        ? { stage: "reveal", modelId: prev.modelId }
        : prev
    );
  }, []);

  const toPicker = useCallback(() => setState({ stage: "picker" }), []);
  const toHub = useCallback(() => navigate("/demo-hub"), [navigate]);

  if (state.stage === "picker") {
    return <FabricationPicker onSelect={handleSelect} />;
  }

  const model = MODELS.find((m) => m.id === state.modelId);
  if (!model) {
    return <FabricationPicker onSelect={handleSelect} />;
  }

  return (
    <AnimatePresence mode="wait">
      {state.stage === "dispatch" && (
        <motion.div key="dispatch" {...FADE}>
          <DispatchStage
            model={model}
            onDone={toFabricate}
            onBack={toPicker}
          />
        </motion.div>
      )}
      {state.stage === "fabricate" && (
        <motion.div key="fabricate" {...FADE}>
          <FabricateStage
            model={model}
            onDone={toPolish}
            onBack={toPicker}
          />
        </motion.div>
      )}
      {state.stage === "polish" && (
        <motion.div key="polish" {...FADE}>
          <PolishStage model={model} onDone={toReveal} onBack={toPicker} />
        </motion.div>
      )}
      {state.stage === "reveal" && (
        <motion.div key="reveal" {...FADE}>
          <RevealStage
            model={model}
            onBack={toHub}
            onPickAnother={toPicker}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
