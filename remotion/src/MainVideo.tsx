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
import { Scene5Heatmap } from "./scenes/Scene5Wins";
import { Scene6Quickwins } from "./scenes/Scene6Wins";
import { Scene7Close } from "./scenes/Scene6Close";

// 7 scenes, ~45s @ 30fps. Transitions overlap 15f each (6 transitions = 90f).
const SCENES = [150, 180, 165, 270, 240, 210, 105];
const TRANSITION = 15;
export const TOTAL_FRAMES =
  SCENES.reduce((a, b) => a + b, 0) - TRANSITION * (SCENES.length - 1);

const slideT = (
  <TransitionSeries.Transition
    presentation={slide({ direction: "from-right" })}
    timing={springTiming({
      config: { damping: 200 },
      durationInFrames: TRANSITION,
    })}
  />
);
const fadeT = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION })}
  />
);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily, background: COLORS.bg }}>
      <DotGrid />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0]}>
          <Scene1Brand />
        </TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={SCENES[1]}>
          <Scene2Paste />
        </TransitionSeries.Sequence>
        {slideT}
        <TransitionSeries.Sequence durationInFrames={SCENES[2]}>
          <Scene3Analyzing />
        </TransitionSeries.Sequence>
        {slideT}
        <TransitionSeries.Sequence durationInFrames={SCENES[3]}>
          <Scene4Map />
        </TransitionSeries.Sequence>
        {slideT}
        <TransitionSeries.Sequence durationInFrames={SCENES[4]}>
          <Scene5Heatmap />
        </TransitionSeries.Sequence>
        {slideT}
        <TransitionSeries.Sequence durationInFrames={SCENES[5]}>
          <Scene6Quickwins />
        </TransitionSeries.Sequence>
        {fadeT}
        <TransitionSeries.Sequence durationInFrames={SCENES[6]}>
          <Scene7Close />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
