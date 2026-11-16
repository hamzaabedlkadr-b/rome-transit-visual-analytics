# Rome scheduled transit service: visual analytics project

**Student:** Hamza Abdul Kader · solo project · [GitHub account](https://github.com/hamzaabedlkadr-b)  
**Course status:** Local working project. Group registration, course-assigned repository and proposal approval are still pending. The official source is a dynamic timetable; this repository keeps the specific 16 November 2026 download so results can be reproduced.

## Run the dashboard

From this folder:

```sh
python3 -m http.server 8765
```

Open `http://localhost:8765/web/`. The app uses plain HTML, CSS and JavaScript and the prepared JSON already included in `web/data/`. It has no package installation or remote runtime dependency.

## Rebuild the data

Install the Python dependency, then run:

```sh
python3 -m pip install -r requirements.txt
python3 prepare_data.py
```

The script reads `data/rome_static_gtfs_2026-11-16.zip` and writes `web/data/rome_transport.json` plus `data_validation.json`. It selects **Wednesday 18 November 2026** from the official [Roma Servizi per la Mobilità GTFS feed](https://romamobilita.it/sistemi-e-tecnologie/open-data/). It is a schedule, not a punctuality or ridership dataset. The original ZIP is 47.7 MB; the browser data file is compact and contains only derived fields needed for analysis.

## Explore

1. Brush a map region or click a stop. The same stop IDs highlight in PCA.
2. Read the selected-versus-remaining median scheduled departures per stop and the hourly departure profile.
3. Brush a PCA region and inspect its locations on the map.
4. Select a named stop in the busiest-stop list, then clear and compare a second group.

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

For browser checks, install Node dependencies with `npm install`, keep the local server running, install Chrome, then run `npm test`. The test checks selection, the top-stop count, clearing and JavaScript errors. In one measured run, page load took **572 ms** and two browser-driven brushes took **35 ms** and **27 ms** on the development machine.

## Repository layout

- `web/`: interactive dashboard and prepared JSON
- `data/`: dated official GTFS ZIP
- `prepare_data.py`, `data_validation.json`: reproducible preparation and audit
- `docs/`: proposal, domain, abstraction, design, algorithms and AI log
- `report/main.tex`: compiling scientific-paper source and figure
- `presentation/`: talk outline and live-demo script
- `prototype.png`: full dashboard capture

## Submission path

The course rules require solo/group registration, a course-created GitHub repository, a proposal issue and **approval before project development is accepted**. The local prototype and paper are therefore review material until the proposal is approved. Copy the approved project into the course repository, update documentation after any feedback, and conduct a user walkthrough before claiming final validation. A personal GitHub repository can serve as an additional development mirror, but does not replace the course repository.

The student email and matricola should be supplied in the course registration form, not published in this development repository. The matricola has not been independently confirmed. The presentation should stay within 20 minutes and the final paper within five pages plus references.
