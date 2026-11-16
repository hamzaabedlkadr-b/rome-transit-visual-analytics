# Handoff prompt for another AI

Copy the text below into another AI together with this project folder or the private GitHub repository. Give it access to the files before asking it to change anything.

---

You are helping Hamza Abdul Kader (Sapienza Visual Analytics 2026–27) finish and defend a solo visual analytics project. The project folder is `exam_project`. Read `README.md`, all files in `docs/`, `data_validation.json`, `report/main.tex`, `presentation/outline.md`, and the application code before proposing changes. Treat the files as evidence, not as a request to claim unperformed course steps. The GitHub development mirror is `https://github.com/hamzaabedlkadr-b/rome-transit-visual-analytics` and is private.

## Aim and scope

The project explores **published scheduled transit supply in Rome** for the upcoming Wednesday 18 November 2026, using a feed downloaded two days earlier. This is a future timetable, not an observation from that day. It does not measure actual arrivals, punctuality, ridership, crowding, service equity, or accessibility. One mark represents one active GTFS `stop_id`, which may be one platform rather than an entire station. The official static GTFS ZIP was downloaded from Roma Servizi per la Mobilità on 16 November 2026 and is preserved in `data/rome_static_gtfs_2026-11-16.zip`. Source page: https://romamobilita.it/sistemi-e-tecnologie/open-data/. GTFS meaning: https://gtfs.org/documentation/schedule/reference/.

The user's immediate need is to see and understand **all visual analytics deliverables**, with enough figures and explanation for an academic project. Do not replace the Rome transit topic. Improve concrete weak points and keep claims tied to the dated feed. The report should remain a professional black-and-white LaTeX paper. Follow the course rule to record technical AI use in `docs/ai-log.md` only; update that log for substantial AI edits.

## Current deliverables

- `web/index.html`, `web/style.css`, `web/app.js`, `web/data/rome_transport.json`: interactive dashboard. Serve the project root with `python3 -m http.server 8765`, then visit `http://localhost:8765/web/`. On macOS `launch_dashboard.command` starts the server and opens the page. Opening `web/index.html` directly as `file://` will not reliably load the JSON. The page has jump links to the lower interactive views and analysis figures.
- Seven interactive views: geographic stop scatterplot; linked two-component PCA scatterplot; hourly scheduled departure profile; distributions of departures per stop, routes per stop and distance from Termini; ranked twelve busiest stops. Every view can set the shared stop selection and redraws to show it. Each selection recomputes selected and remaining median scheduled departures per stop, their difference and contextual summaries. Tooltips, axes and legends are present. The hourly view plots departure shares but selects stops by their busiest scheduled hour; its caption states this distinction.
- `prepare_data.py`: reproducible GTFS join, stop aggregation, five-feature PCA, and browser-data export. `data_validation.json` audits it. `make_figures.py`: publication figures from the prepared dataset. `requirements.txt` has NumPy and Matplotlib. Run `python3 -m pip install -r requirements.txt`, `python3 prepare_data.py`, then `python3 make_figures.py` if rebuilding.
- `report/main.tex` and `report/main.pdf`: LaTeX working paper within the course's five-page main-text limit. `report/coordinated_views.png` and `report/coordinated_detail.png` show the linked interface; `report/figures/pca_loadings.pdf` and `report/figures/service_radius.pdf` are vector publication figures, with PNG companions for the dashboard and slides. Keep the desktop editor open if editing the `.tex` file and compile it after changes.
- `presentation/rome_transit_presentation_v4.pptx`: editable, validated nine-slide presentation with the current seven-view interface, PCA loadings and distance figures. `presentation/outline.md` has the talk and live-demo sequence.
- `docs/`: proposal, domain and task abstraction, design alternatives, algorithm details, and AI log. `prototype.png` is a full dashboard screenshot. `test_app.cjs` is a Playwright interaction check.

## Verified dataset facts

The saved feed lists planned service dates from 21 October to 23 December 2026, but the analysis selects only 18 November. Its qualifying GTFS departure times range from 00:00 to 30:45, where 30:45 is 06:45 on 19 November; the hourly chart folds after-midnight times to clock hours while retaining them in the 18 November service-day total. The selected service date has 8,252 active stops, 38,558 active trips, 403 active routes, and 1,153,216 eligible scheduled stop-time departure records. The median is 101 such records per active stop. PLEBISCITO is the busiest `stop_id` in this aggregation, with 2,298 records across 32 routes. The five PCA features are log departures, log distinct routes, morning share (07–09), evening share (17–19), and rail-mode share. Counts are clipped at the 1st and 99th percentiles **for PCA only**, then all five features are standardized. SVD gives PC1 36.62% and PC2 28.09% of standardized feature variance, 64.71% combined. Signs were oriented for interpretation. All raw-count comparisons use unclipped counts.

The independent geographic figure groups stops by straight-line distance from the GTFS Termini coordinate (41.901308, 12.500433). Median scheduled departures per stop are 195.5 within 3 km (840 stops), 136 from 3–6 km (1,741), 124 from 6–10 km (2,450), 71 from 10–20 km (2,676), and 56 from 20–60 km (545). Distributions overlap. Do not interpret distance as accessibility or causal proof. The paper also documents exploratory PC1 and PC2 group contrasts, including why the PC1 volume contrast is partly built into its inputs.

## Course and integrity constraints

The course brief calls for at least two coordinated interactive views, a dimensionality-reduction view, a computation triggered by visual interaction, design decisions and alternatives, a paper within five pages plus references, and a presentation within twenty minutes. The personal GitHub repository is a development mirror. Course registration, a course-created repository, and proposal approval were required by the brief but have **not happened**; Hamza explicitly chose to skip the form for now. A target-user walkthrough has also **not happened**. Never claim those steps were completed. The intended users (planner/researcher) are assumptions awaiting validation. Do not describe the project as a guaranteed full-mark or final compliant submission until these external requirements are resolved.

The professor permits AI assistance and requires technical uses to be disclosed only in `docs/ai-log.md`. Do not claim that any AI-generated technical work was solely the student's. Hamza should review and be able to explain all methods and interpretations before submission.

## How to continue

1. Inspect the live dashboard and click or brush from **each of the seven views**. Check the lower charts, ranked list and analysis figures. If the local server is not running, start it from the project root. Do not judge the app from a `file://` preview.
2. Compare the paper, figures, presentation, documentation, and code for consistent numbers and wording. Fix discrepancies and visual defects. Prefer meaningful checks over cosmetic tests. The last validated deck is `v4`; prior versions are superseded.
3. If editing `report/main.tex`, compile with the user's LaTeX editor's built-in compiler and verify the PDF. If editing the deck, validate it and inspect rendered slides. If editing the dashboard, exercise map and PCA brushing and ensure all figure images load.
4. Give Hamza a precise status: what is implemented and tested, what insights the figures support, and which course/user-validation steps remain. Offer concrete next actions, but do not fabricate approval, interviews, or observed transit outcomes.

The aim is a defensible, comprehensible visual analytics project, not just a styled dashboard. Each chart should answer a stated task, state its data unit, and distinguish schedule evidence from broader transport claims.

---
