# Rome scheduled transit service: visual analytics project

**Student:** Hamza Abdul Kader · solo project · [GitHub account](https://github.com/hamzaabedlkadr-b)  
**Course status:** Local working project. Group registration, course-assigned repository and proposal approval are still pending. The official source is a dynamic timetable; this repository keeps the specific 16 November 2026 download so results can be reproduced.

**Expected exam session:** First available session; update this line when the date is announced.

## Run the dashboard

From this folder:

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765/web/`. The app uses plain HTML, CSS and JavaScript and the prepared JSON already included in `web/data/`. It has no package installation or remote runtime dependency.

On macOS, you can also double-click `launch_dashboard.command` in this folder. The page has jump links for the seven interactive views and two companion analysis figures.

## Rebuild the data

Install the Python dependency, then run:

```sh
python3 -m pip install -r requirements.txt
python3 prepare_data.py
```

The script reads `data/rome_static_gtfs_2026-11-16.zip` and writes `web/data/rome_transport.json` plus `data_validation.json`. Run `python3 make_figures.py` to regenerate the publication figures from that prepared JSON. It selects **Wednesday 18 November 2026** from the official [Roma Servizi per la Mobilità GTFS feed](https://romamobilita.it/sistemi-e-tecnologie/open-data/). It is a schedule, not a punctuality or ridership dataset. The original ZIP is 47.7 MB; the browser data file is compact and contains only derived fields needed for analysis.

## Explore

Seven views share one stop selection, coordinated in both directions: map, PCA, hourly profile, departures per stop, routes per stop, distance from Termini, and a ranked busiest-stop list. Any of them can set the selection; all of them redraw to show it.

1. Brush a map region or click a stop. The same stops highlight in PCA, and the four distributions compare the selection (dark) with all stops (light).
2. Read the selected-versus-remaining median scheduled departures per stop.
3. Brush a PCA region and inspect its locations on the map.
4. Drag across a distribution (an hour range, departure or route bins, a distance band) and see where those stops are.
5. Select a named stop in the busiest-stop list, then clear and compare a second group.

PC1 describes a combination of departure volume and distinct routes. PC2 emphasizes time-of-day shares. The first two components explain **64.71%** of the five-feature standardized variance; the other 35.29% is outside the plot. The axes and calculations are documented in `docs/`.

## Key data checks

| Measure | Count |
| --- | ---: |
| Stops with valid bounded coordinates | 8,325 |
| Stops with scheduled service on chosen date | 8,252 |
| Active trips | 38,558 |
| Active routes | 403 |
| Qualifying scheduled stop departures | 1,153,216 |
| Median scheduled departures per active stop | 101 |

For browser checks, install Node dependencies with `npm install`, keep the local server running, install Chrome, then run `npm test`. The test makes a selection from each of the seven views and checks that every other view changes, plus the top-stop value, clearing and JavaScript errors. It uses Playwright's bundled Chromium; set `PW_CHANNEL=chrome` to use installed Chrome. In one headless Chrome run, page load took **595 ms** and each selection, including simulated input and redrawing all views, took **51–194 ms**.

## Repository layout

- `web/`: interactive dashboard and prepared JSON
- `data/`: dated official GTFS ZIP
- `prepare_data.py`, `make_figures.py`, `data_validation.json`: reproducible preparation, figures and audit
- `docs/`: proposal, domain, abstraction, design, algorithms and AI log
- `report/main.tex` and `report/main.pdf`: scientific paper and compiled PDF
- `presentation/`: current nine-slide PowerPoint deck and live-demo outline
- `prototype.png`: full dashboard capture

## Course deliverables

| Requirement | File or evidence | Status |
| --- | --- | --- |
| One-page proposal | `docs/00-proposal.md` | Draft; course issue and approval pending |
| Domain, abstraction, design, algorithms | `docs/01-domain.md` through `docs/04-algorithms.md` | Present; alternatives and checks included |
| Technical AI-use log | `docs/ai-log.md` | Present |
| Working system with linked views, PCA and visual analytics | `web/`, `prepare_data.py`, `test_app.cjs` | Seven selection sources pass the browser test |
| Scientific paper, at most five pages plus references | `report/main.tex`, `report/main.pdf` | Compiles to five pages total |
| Presentation and live demo | `presentation/rome_transit_presentation_v4.pptx`, `presentation/outline.md` | Nine slides and demo sequence present |

## Submission path

The course rules require solo/group registration, a course-created GitHub repository, a proposal issue and **approval before project development is accepted**. The local prototype and paper are therefore review material until the proposal is approved. Copy the approved project into the course repository, update documentation after any feedback, and conduct a user walkthrough before claiming final validation. A personal GitHub repository can serve as an additional development mirror, but does not replace the course repository.

The student email and matricola should be supplied in the course registration form, not published in this development repository. The presentation should stay within 20 minutes and the final paper within five pages plus references. Technical AI use is recorded in `docs/ai-log.md` as the course requires.
