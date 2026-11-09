import { PAUSE_KEY } from "@/components/site/stage/pause";

/** Session flag: the mark has drawn itself once in this tab (later views show it still). */
export const INTRO_KEY = "obm:brand-intro";

/**
 * Runs before the first paint (SiteShell, top of <body>), so the mark is never painted whole
 * and then hidden: on the first view of a session, with motion allowed and not paused, it
 * sets html[data-brand-intro="on"] and app/brand-motion.css draws the mark in once. Storage
 * may throw (private windows, blocked storage): then nothing animates.
 */
export const INTRO_SCRIPT = `try{var s=sessionStorage;s.getItem("${INTRO_KEY}")||!matchMedia("(prefers-reduced-motion: no-preference)").matches||localStorage.getItem("${PAUSE_KEY}")==="1"||(document.documentElement.dataset.brandIntro="on");s.setItem("${INTRO_KEY}","1")}catch(e){}`;
