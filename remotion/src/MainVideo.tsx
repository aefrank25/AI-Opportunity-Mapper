import React from "react";
import { AbsoluteFill } from "remotion";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { DotGrid } from "./components/DotGrid";
import { fontFamily, COLORS } from "./theme";
import { Scene1Brand } from "./scenes/Scene1Brand";
import { Scene2Paste } from "./scenes/Scene2Paste";
import { Scene3Analyzing } from "./scenes/Scene3Analyzing";
import { Scene4Map } from "./scenes/Scene4Map";
import { Scene5Wins } from "./scenes/Scene5Wins";
import { Scene6Close } from "./scenes/Scene6Close";

const SCENES = [90, 135, 165, 195, 135, 105];
const TRANSITION = 15;
export const TOTAL_FRAMES =
  SCENES.reduce((a, b) => a + b, 0) - TRANSITION * (SCENES.length - 1);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily, background: COLORS.bg }}>
      <DotGrid />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0]}>
          <Scene1Brand />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[1]}>
          <Scene2Paste />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: TRANSITION,
          })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[2]}>
          <Scene3Analyzing />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: TRANSITION,
          })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[3]}>
          <Scene4Map />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: TRANSITION,
          })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[4]}>
          <Scene5Wins />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={SCENES[5]}>
          <Scene6Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
