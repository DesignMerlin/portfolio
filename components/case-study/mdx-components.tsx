import { Callout, Figure, HMW, Methods, Section } from "@/components/case-study/blocks";
import { CompareSlider } from "@/components/case-study/compare-slider";
import { DecisionLog } from "@/components/case-study/decision-log";
import { Findings } from "@/components/case-study/findings";
import { IATree } from "@/components/case-study/ia-tree";
import { JourneyMap } from "@/components/case-study/journey-map";
import { Personas } from "@/components/case-study/personas";
import { Prototype } from "@/components/case-study/prototype";
import { TestingRounds } from "@/components/case-study/testing-rounds";
import { UserStories } from "@/components/case-study/user-stories";

/** Everything a case study MDX file can use */
export const mdxComponents = {
  Section,
  HMW,
  Callout,
  Figure,
  Methods,
  CompareSlider,
  DecisionLog,
  Findings,
  IATree,
  JourneyMap,
  Personas,
  Prototype,
  TestingRounds,
  UserStories,
};
