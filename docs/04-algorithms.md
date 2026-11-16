# Algorithms and implementation

## GTFS preparation

`prepare_data.py` reads the dated ZIP without extracting it. It selects service IDs active on 2026-11-18 from `calendar_dates.txt`, joins active trips to routes, and counts eligible `stop_times.txt` records by stop and clock hour. Explicit `pickup_type=1` records are excluded. Hours at or above 24 are folded modulo 24 for the time-of-day chart. Stops outside the documented Rome bounding box or with malformed coordinates are excluded. The output is a compact browser JSON file and a machine-readable `data_validation.json` audit.

## PCA

The five features are `log1p(departures)`, `log1p(distinct routes)`, morning share, evening share and rail-mode share. Each column is clipped to its 1st/99th percentile for PCA only, then z-standardized. NumPy SVD gives the scores. Signs are fixed to make PC1 positive for departure volume and PC2 positive for morning share. PC1 explains 36.616%, PC2 28.092%, or 64.708% combined. The other 35.292% is not shown. Raw counts, not clipped values, appear in comparison cards.

## Selection-triggered computation

Canvas pointer events define a screen rectangle. The app tests every stop's screen position and stores the matching row indexes in one `Set`. Map and PCA use that rectangle or a nearest-point click. Dragging a range in the hourly, departure, route or distance chart builds a stop set from the selected bins; hourly brushing uses each stop's busiest scheduled hour, while its bars display departure shares. The ranked list selects a named stop. All seven views redraw from the same set. The app computes separate selected and remaining medians of scheduled departures per stop and their difference, plus hourly departures, median route count, rail-mode share and median distance from Termini.

## Complexity and observed performance

Each selection scans at most 8,252 stops. Median sorting is O(n log n); redraw across the views is O(n) in the number of stops. In one headless Chrome run on the development machine, the page and JSON loaded in 595 ms and seven browser-driven selections took 51–194 ms each, including simulated input and redraw. These are one-run measurements, not guarantees across devices. The browser test checked selection from every view, updates in the six other views, the top-stop value, clearing and JavaScript errors.

## Alternatives rejected

- t-SNE/UMAP could emphasize local clusters but yield less interpretable, less stable axes for the service-volume question.
- A server-side query service is unnecessary for this fixed-size snapshot and would add deployment requirements.
- A dynamic real-time comparison is outside this reproducible one-day analysis; a future system would need stored observations and missing-feed handling.
