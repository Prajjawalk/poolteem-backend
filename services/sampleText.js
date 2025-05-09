export const text = `
WEBVTT

00:00:00.000 --> 00:02:00.000
PM (Alex): Good afternoon! Thanks for making the time, everyone.
Client (Neha): Afternoon, Alex. Happy to be here.
PM (Alex): The goal today is to sync on progress, unblock anything critical, and lock next‑step actions. Let’s jump in.

00:02:00.000 --> 00:04:00.000
PM (Alex): First, overall project health: last sprint closed at 92 % completion. The remaining spillovers have been re‑prioritized in the backlog.
Client (Neha): Sounds good. Any major risks you see right now?
PM (Alex): Only a slight delay on the design hand‑off, but UX has promised final screens by Friday.

00:04:00.000 --> 00:06:00.000
Client (Neha): Great. Marketing would love those screens for the teaser blog.
PM (Alex): Roger that. I’ll nudge the design team to keep the cadence tight.

00:06:00.000 --> 00:08:00.000
PM (Alex): On engineering bandwidth, we added one extra front‑end dev this week. Velocity should tick up by roughly 5 story points.
Client (Neha): Nice—should help us ship that dashboard sooner.

00:08:00.000 --> 00:10:00.000
PM (Alex): Speaking of the dashboard, QA found two edge‑case bugs in the calculation module. Fix is underway, ETA tomorrow.
Client (Neha): Appreciate the quick turnaround.

00:10:00.000 --> 00:12:00.000
Client (Neha): Any early feedback from the pilot users?
PM (Alex): Mostly positive. They asked for clearer tooltips, which UX is already addressing.

00:12:00.000 --> 00:14:00.000
PM (Alex): Before we hit the core tickets, quick note on backlog grooming—yesterday’s refinement session trimmed 12 outdated tasks.
Client (Neha): Good housekeeping. Let’s keep it lean.

00:14:00.000 --> 00:16:00.000
PM (Alex): Now, onto estimation. I’d like to revisit the “Effort‑Estimate” story because it underpins how we forecast.

00:16:00.000 --> 00:18:00.000
PM (Alex): Jira #1—“As a team, I’d like to estimate the effort of a story in Story Points.” Currently it sits at 5 SP.
Client (Neha): I remember. Any update?

00:18:00.000 --> 00:20:00.000
PM (Alex): Dev team ran Planning Poker again after clarifying acceptance criteria. Consensus dropped to 4 SP.
Client (Neha): Good—you’ve already changed the value in the Estimate field?
PM (Alex): Yes, updated this morning.

00:20:00.000 --> 00:22:00.000
Client (Neha): Does that shift sprint capacity?
PM (Alex): Slightly; velocity now projects at 48 SP instead of 49. No impact on timeline.

00:22:00.000 --> 00:24:00.000
PM (Alex): Reminder: Story Points help us gauge relative effort, avoiding the inaccuracies of hour‑based estimates.
Client (Neha): Makes sense. Planning Poker is paying off.

00:24:00.000 --> 00:26:00.000
Client (Neha): Out of curiosity, could we ever switch to time‑based estimates?
PM (Alex): Possible—Jira lets us flip to “Original Time Estimate,” but I’d caution against it until our point velocity stabilizes for another two sprints.

00:26:00.000 --> 00:28:00.000
PM (Alex): Cool. That wraps Ticket #1. Let’s pivot to design feedback you sent yesterday.

00:28:00.000 --> 00:30:00.000
Client (Neha): Right—the color contrast on the analytics cards felt low.
PM (Alex): Design is adjusting contrast ratios to meet WCAG AA.

00:30:00.000 --> 00:32:00.000
PM (Alex): On API integration, we finished the auth handshake with the third‑party provider. Sandbox keys are live.
Client (Neha): Perfect. Our security team will pen‑test next week.

00:32:00.000 --> 00:34:00.000
Client (Neha): Any blockers you want me to escalate?
PM (Alex): Just waiting on their rate‑limit policy doc; a gentle prod from your side would help.

00:34:00.000 --> 00:36:00.000
PM (Alex): Risk register: medium risk on data‑import latency, but caching strategy draft looks promising.
Client (Neha): Keep me posted.

00:36:00.000 --> 00:38:00.000
PM (Alex): Resource note: the extra front‑end dev starts full capacity Monday.
Client (Neha): Great, that should smooth the micro‑interaction work.

00:38:00.000 --> 00:40:00.000
Client (Neha): One more thing—partner integration timeline?
PM (Alex): Partner API v2 is slipping by a week; roadmap adjusted accordingly.

00:40:00.000 --> 00:42:00.000
PM (Alex): Let’s shift to sprint planning mechanics—ties directly to Jira #2.

00:42:00.000 --> 00:44:00.000
PM (Alex): Jira #2—“As a team, I’d like to commit to a set of stories to be completed in a sprint.” We need to Create Sprint but can’t start it yet because Sprint 14 is still active.
Client (Neha): Understood. So we prep the next sprint backlog now?

00:44:00.000 --> 00:46:00.000
PM (Alex): Exactly. I dragged the sprint footer to include eight top‑priority issues—totaling 46 SP.
Client (Neha): Any chance we split the payment‑gateway story? It feels bulky.

00:46:00.000 --> 00:48:00.000
PM (Alex): Good call. Devs will slice it into “setup” and “edge‑case handling.” That should de‑risk commitment.
Client (Neha): Thanks.

00:48:00.000 --> 00:50:00.000
Client (Neha): Once Sprint 14 closes Friday, how soon will Sprint 15 start?
PM (Alex): Same day, after the retro—so zero gap.

00:50:00.000 --> 00:52:00.000
PM (Alex): Action items: I’ll finalize the Sprint 15 scope in Jira; you’ll confirm priority order by EOD tomorrow.
Client (Neha): Done.

00:52:00.000 --> 00:54:00.000
Client (Neha): Any final questions from your side?
PM (Alex): Just one—can we get the updated legal copy for the onboarding flow?

00:54:00.000 --> 00:56:00.000
Client (Neha): Legal will send the finalized text by noon tomorrow.
PM (Alex): Perfect. That unblocks dev from hard‑coding placeholder text.

00:56:00.000 --> 00:58:00.000
PM (Alex): To recap—Ticket #1 estimate updated to 4 SP; Ticket #2 sprint prep underway; design assets Friday; partner API v2 delayed one week; legal copy tomorrow.
Client (Neha): Crystal clear.

00:58:00.000 --> 01:00:00.000
PM (Alex): Thanks, everyone. Great collaboration. Talk to you next week at the same time.
Client (Neha): Thanks, Alex. Bye!
`