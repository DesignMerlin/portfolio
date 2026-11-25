"use client";

import { useEffect, useRef } from "react";
import { play, STAGE_H, STAGE_W, type Frame } from "@/components/case-study/film/kit";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { NAV_TONE } from "@/components/site/use-nav-tone";

export type FilmProps = { playing: boolean; rate?: number };

/** Module-level constant: the scene is rebuilt when it changes */
export type FilmScript = {
  /** One loop, in seconds */
  length: number;
  /** The frame shown when the film isn't playing */
  poster: number;
  /** Whether what's behind the site's nav is dark or light, and from when */
  tones?: [at: number, tone: "dark" | "light"][];
  /** What each [data-track] element does over the loop */
  tracks: Record<string, Frame[]>;
};

/**
 * Runs a film: every [data-track] inside the root becomes a looping Web
 * Animation (transform, opacity or clip-path, so it stays off the main
 * thread). They all share one clock, so pausing and slow motion apply to the
 * whole scene. The fixed-size stage is scaled to cover its card.
 *
 * Not playing (off screen, covered, paused before it starts, or reduced
 * motion): holds on the poster frame.
 */
export function useFilm(script: FilmScript, { playing, rate = 1 }: FilmProps) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  const started = useRef(false);

  // Fit the fixed-size stage to the card
  useEffect(() => {
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const fit = () => {
      st.style.scale = String(Math.max(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
      st.style.visibility = "visible";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Build the scene once, held on the poster frame
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const all: Animation[] = [];
    el.querySelectorAll<HTMLElement>("[data-track]").forEach((n) => {
      const frames = script.tracks[n.dataset.track!];
      if (frames) all.push(...play(n, frames, script.length));
    });
    all.forEach((a) => {
      a.pause();
      a.currentTime = script.poster * 1000;
    });
    anims.current = all;
    started.current = false;
    return () => {
      all.forEach((a) => a.cancel());
      anims.current = [];
    };
  }, [script]);

  useEffect(() => {
    const run = playing && !reduce;
    const all = anims.current;
    if (run && !started.current) {
      // First play starts from the top; after that, pausing and resuming carry on where it was
      started.current = true;
      all.forEach((a) => (a.currentTime = 0));
    }
    all.forEach((a) => (run ? a.play() : a.pause()));
  }, [playing, reduce]);

  // Tell the nav how bright the film is right now, so its words can be read over it
  useEffect(() => {
    const el = root.current;
    const tones = script.tones;
    if (!el || !tones) return;
    const say = () => {
      const a = anims.current[0];
      const t = a ? (Number(a.currentTime ?? 0) / 1000) % script.length : script.poster;
      const tone = tones.findLast(([at]) => at <= t)?.[1] ?? tones[0]![1];
      if (el.dataset.navTone === tone) return;
      el.dataset.navTone = tone;
      dispatchEvent(new Event(NAV_TONE));
    };
    say();
    if (!playing || tones.length < 2) return;
    const timer = setInterval(say, 200);
    return () => clearInterval(timer);
  }, [script, playing]);

  useEffect(() => {
    anims.current.forEach((a) => a.updatePlaybackRate(rate));
  }, [rate]);

  return { root, stage };
}
