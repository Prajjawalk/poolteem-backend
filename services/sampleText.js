export const text = `
00:00:00.000 --> 00:01:00.000
PM (Alex): Good morning, Neha! Ready for our weekly deep-dive?
Client (Neha): Morning, Alex. Got my coffee and a long list of questions.
PM (Alex): Perfect—today we’ll cover metrics, backlog hygiene, new user-story work, the latest bug queue, and next-sprint resourcing. Let’s roll.

00:01:00.000 --> 00:02:00.000
PM (Alex): First, velocity recap: Sprint 15 closed at 51 story points, up from 48 last sprint.
Client (Neha): Nice uptick. Any major spillovers?
PM (Alex): Only two—both dependency-blocked items, now re-scheduled for Sprint 16.

00:02:00.000 --> 00:03:00.000
Client (Neha): And customer feedback from the pilot?
PM (Alex): Ninety-one percent positive. Top ask: richer filter options on the analytics view. UX has mock-ups queued.

00:03:00.000 --> 00:04:00.000
PM (Alex): Speaking of UX, the new design-system tokens are live in Figma. Devs already mapped them to Tailwind variables.
Client (Neha): That should speed front-end theming—great.

00:04:00.000 --> 00:05:00.000
Client (Neha): Any blockers on the payments refactor?
PM (Alex): Just waiting for legal approval on revised T&Cs. ETA Monday noon.

00:05:00.000 --> 00:06:00.000
PM (Alex): Quick infra note: we moved nightly builds to the new CI runner—40 % faster, fewer flaky tests.
Client (Neha): Ops team will love that.

00:06:00.000 --> 00:07:00.000
PM (Alex): OK, let’s zoom into Product goals for Q3. KR-1 is “Reduce onboarding drop-off to <15 %.” We’re at 22 % today.
Client (Neha): Tighter copy and progressive profiling should help there.

00:07:00.000 --> 00:08:00.000
PM (Alex): Agreed. Marketing proposed an A/B test on the welcome screen—launching next week.
Client (Neha): Good; I’ll sync with their PM to align metrics.

00:08:00.000 --> 00:09:00.000
Client (Neha): You also mentioned expanding the beta cohort?
PM (Alex): Yes—doubling to 100 users. Support is prepped.

00:09:00.000 --> 00:10:00.000
PM (Alex): Cool. Now let’s open the backlog lens, because we’ve been reshaping how we express work—this ties directly to one of today’s Jira tickets.
Client (Neha): Ah, the user-story revamp?

00:10:00.000 --> 00:11:00.000
PM (Alex): Exactly. Jira Ticket #1—“As a product owner, I’d like to express work in terms of actual user problems and place them in the backlog.”
Client (Neha): Right—moving from tech-tasks to user language.

00:11:00.000 --> 00:12:00.000
PM (Alex): We ran a workshop Tuesday. Each squad rewrote their top five backlog items into the “As a (role) I want (need) so that (benefit)” format.
Client (Neha): Nice. Did they log them with “+ Create Issue” in the Sample Scrum Project?
PM (Alex): Yep. Twenty-three new stories created and ranked.
Client (Neha): Quick insight—our latest funnel report shows 42 % of new sign-ups abandon on the “Company Size” step. The field feels vague. If we swap it for radio buttons with helper copy, we could claw back ~15 % of those users.

00:12:00.000 --> 00:13:00.000
Client (Neha): Any examples?
PM (Alex): “As a freelance accountant I want to bulk-import invoices so that I save manual entry time.” That surfaced a crucial Excel-parser task we hadn’t flagged.

00:13:00.000 --> 00:14:00.000
Client (Neha): Good catch. How did the team react to looser implementation detail?
PM (Alex): Positive. They see stories as placeholders for conversation—sets context without boxing them in technically.

00:14:00.000 --> 00:15:00.000
PM (Alex): We also cleaned stale tasks—velocity impact minimal, but focus improved.
Client (Neha): Great housekeeping.

00:15:00.000 --> 00:16:00.000
Client (Neha): Did you adjust backlog ranking after the rewrite?
PM (Alex): I did. Items delivering biggest onboarding wins float to the top—matches KR-1.

00:16:00.000 --> 00:17:00.000
PM (Alex): One follow-up: engineering asked for acceptance-criteria guidelines, because some stories lacked edge-case notes.
Client (Neha): I’ll draft a Definition of Ready checklist.

00:17:00.000 --> 00:18:00.000
PM (Alex): Perfect. Also, we may need one more UX researcher for continuous-discovery interviews—budget?
Client (Neha): Approved for two sprints—let’s pilot and evaluate.

00:18:00.000 --> 00:19:00.000
PM (Alex): Switching gears—security scan flagged a mild dependency CVE. Patch merged; no user impact.
Client (Neha): Thanks for the proactive heads-up.
Client (Neha): Competitive intel: FinPro just launched a bulk-import wizard that auto-maps CSV headers. Reviewers love the “smart mapping” tooltip. If we’re adding Excel import, a lightweight header-detection MVP keeps us feature-parity.

00:19:00.000 --> 00:20:00.000
PM (Alex): On analytics, event-taxonomy v2 launched. Data is flowing to Mixpanel.
Client (Neha): Cool—marketing will slice conversion funnels next week.

00:20:00.000 --> 00:21:00.000
Client (Neha): Do we have timeline for the Excel bulk-import MVP you mentioned?
PM (Alex): Dev start next sprint; two sprints build; one sprint hardening.

00:21:00.000 --> 00:22:00.000
PM (Alex): I’ve already looped analytics to add success events for bulk import.
Client (Neha): Data-first—love it.

00:22:00.000 --> 00:23:00.000
PM (Alex): Quick detour: finance approved our AWS reserved-instance plan—20 % infra savings.
Client (Neha): Nice win.
Client (Neha): Budget notice—our enterprise prospect in Singapore can’t move forward unless we offer SAML SSO by Sept 15. That’s ~$120 k ARR, so a fast-track lane may be worthwhile.

00:23:00.000 --> 00:24:00.000
PM (Alex): Any questions before we dive into upcoming sprint scope?
Client (Neha): None—go ahead.

00:24:00.000 --> 00:25:00.000
PM (Alex): Sprint 16 draft: 52 SP capacity. Top stories: bulk-import spike, onboarding-copy update, and data-layer caching.
Client (Neha): All align with our OKRs.

00:25:00.000 --> 00:26:00.000
PM (Alex): Cool. I’ll finalize after tomorrow’s refinement.
Client (Neha): Works.

00:26:00.000 --> 00:27:00.000
PM (Alex): Marketing asked if we can surface “time saved” as a metric in the UI.
Client (Neha): Engaging, but we need reliable data first.
Client (Neha): Feature request—finance team wants a one-click Export to Google Sheets for monthly reconciliations. Even a basic CSV-to-Sheets connector in Beta would be a big win.

00:27:00.000 --> 00:28:00.000
PM (Alex): Agreed—instrumentation backlog ticket created, but de-prioritized until Q4 so as not to derail current focus.
Client (Neha): Fair point.

00:28:00.000 --> 00:29:00.000
Client (Neha): What about accessibility audit?
PM (Alex): External vendor booked—audit starts week after next.

00:29:00.000 --> 00:30:00.000
PM (Alex): That wraps user-story portion. Shall we pivot to the bug landscape?
Client (Neha): Yes, the dreaded bug queue.

00:30:00.000 --> 00:31:00.000
PM (Alex): Bug burndown chart shows 28 open, 12 P2s, 3 P1s.
Client (Neha): P1s first, obviously. Any customer-visible?
PM (Alex): Only one—intermittent PDF export failure. Temporary retry shipped yesterday.
Client (Neha): The PDF glitch blocks our quarterly compliance audit on May 30. If it’s not fixed, finance must file manually—huge overhead. Can we mark that P1 with a hard deadline?

00:31:00.000 --> 00:32:00.000
PM (Alex): This dovetails into Jira Ticket #2—“Bugs, tasks and other issue types in backlog; bugs not normally estimated.”
Client (Neha): Right—do we keep them un-pointed?

00:32:00.000 --> 00:33:00.000
PM (Alex): So far, yes. Team considers bugs overhead. Velocity remains clean—story points reflect new value.
Client (Neha): Makes sense.

00:33:00.000 --> 00:34:00.000
PM (Alex): That said, QA suggested pointing long-running refactor-style bugs to show planning impact.
Client (Neha): Reasonable—maybe apply points selectively?

00:34:00.000 --> 00:35:00.000
PM (Alex): Exactly. Jira’s field config lets us add “Story Points” to the Bug issue type. I’ll pilot on tech-debt bugs over four hours effort.
Client (Neha): Good experiment—flag results in retro.

00:35:00.000 --> 00:36:00.000
PM (Alex): Also added a “Root-cause” custom field for bugs—database, UI, third-party, etc.—to spot patterns.
Client (Neha): Data for continuous improvement—love it.

00:36:00.000 --> 00:37:00.000
PM (Alex): Resource ask: QA capacity is thin. I propose contracting one part-time tester for four weeks.
Client (Neha): Approved—budget comes from contingency.

00:37:00.000 --> 00:38:00.000
PM (Alex): Security-bug triage is tomorrow morning; I’ll send you notes.
Client (Neha): Please do; legal wants visibility.

00:38:00.000 --> 00:39:00.000
Client (Neha): We’ve talked about estimation—how about Definition of Done for bugs?
PM (Alex): Added criteria: regression test added, root-cause documented, monitoring alert if server-side.

00:39:00.000 --> 00:40:00.000
PM (Alex): That should reduce reopen rate.
Client (Neha): Perfect.

00:40:00.000 --> 00:41:00.000
PM (Alex): Reopen rate dropped from 14 % to 6 % since we enforced automated tests on bug fixes.
Client (Neha): Huge improvement.
Client (Neha): Performance feedback from India pilot: on 3G networks TTI jumps to ~7 s. Users blame the animated dashboard cards. Maybe lazy-load below the fold?

00:41:00.000 --> 00:42:00.000
PM (Alex): Let’s talk performance: cold-start time is 3.2 s; goal is under 2.5.
Client (Neha): Any low-hanging fruit?
PM (Alex): Bundle splitting and CDN edge caching scheduled for Sprint 17.

00:42:00.000 --> 00:43:00.000
Client (Neha): Good. Marketing launch requires snappy first impression.
PM (Alex): Exactly.

00:43:00.000 --> 00:44:00.000
PM (Alex): Architecture committee proposed server-side rendering for critical pages.
Client (Neha): Cost analysis?
PM (Alex): +5 % infra, –30 % TTI on slow connections. We’ll prototype first.

00:44:00.000 --> 00:45:00.000
Client (Neha): Keep me posted on prototype outcomes.
PM (Alex): Will do.

00:45:00.000 --> 00:46:00.000
PM (Alex): Next up—internationalization. Locale-switcher skeleton is in; French and Hindi target Q4.
Client (Neha): Great for our India pilot.
Client (Neha): Process inefficiency—our team’s drowning in status emails (daily stand-ups + build alerts). Could we consolidate into a single weekly digest to cut noise?

00:46:00.000 --> 00:47:00.000
PM (Alex): We’ll integrate PhraseApp for strings this sprint—reduces dev toil.
Client (Neha): Sounds good.

00:47:00.000 --> 00:48:00.000
Client (Neha): Timeline check: public launch still end-of-August?
PM (Alex): Yes. Critical path is payments refactor, performance, and accessibility—all green so far.
Client (Neha): Marketing heads-up: paid-ads campaign kicks off July 10. We need API docs and a public changelog live by June 26, or we slip the ad-buy window.

00:48:00.000 --> 00:49:00.000
PM (Alex): On community side, we’ll open a feedback portal using Canny.
Client (Neha): That will centralize requests—thumbs up.

00:49:00.000 --> 00:50:00.000
PM (Alex): One ask: marketing wants API docs public by beta-2.
Client (Neha): Doc-team committed?
PM (Alex): They need a Swagger update—dev help assigned.

00:50:00.000 --> 00:51:00.000
Client (Neha): Support training plan?
PM (Alex): We’ll run a two-hour product walk-through and provide a sandbox tenant for them.

00:51:00.000 --> 00:52:00.000
PM (Alex): Before we wrap, let’s review action items.
Client (Neha): Hit me.

00:52:00.000 --> 00:53:00.000
PM (Alex): 1) Alex: finalize Sprint 16 stories after refinement tomorrow. 2) Neha: draft Definition-of-Ready checklist by Monday. 3) Alex: hire part-time QA contractor.

00:53:00.000 --> 00:54:00.000
PM (Alex): 4) Neha: send legal-approved T&Cs for payments by Monday noon. 5) Alex: schedule performance-prototype spike.

00:54:00.000 --> 00:55:00.000
Client (Neha): All noted. I’ll also ping marketing about the Canny launch copy.
PM (Alex): Perfect.

00:55:00.000 --> 00:56:00.000
PM (Alex): Quick recap of our two Jira tickets:
 • Ticket #1—User-story backlog rewrite complete; 23 stories properly formatted, ranked, and ready.
 • Ticket #2—Bug handling: keep most bugs un-pointed, pilot pointing for >4 h tech-debt bugs; root-cause field added.

00:56:00.000 --> 00:57:00.000
Client (Neha): Clear and concise—thanks.
PM (Alex): Great. Anything else before we close?

00:57:00.000 --> 00:58:00.000
Client (Neha): Nothing from me. Appreciate the thorough update.
PM (Alex): My pleasure.

00:58:00.000 --> 00:59:00.000
PM (Alex): I’ll circulate minutes and recording within the hour.
Client (Neha): Looking forward to them.

00:59:00.000 --> 01:00:00.000
PM (Alex): Thanks, Neha. Have a productive week!
Client (Neha): You too, Alex. Bye.
`