# Algorithms and implementation

## GTFS preparation

`prepare_data.py` reads the dated ZIP without extracting it. It selects service IDs active on 2026-11-18 from `calendar_dates.txt`, joins active trips to routes, and counts eligible `stop_times.txt` records by stop and clock hour. Explicit `pickup_type=1` records are excluded. Hours at or above 24 are folded modulo 24 for the time-of-day chart. Stops outside the documented Rome bounding box or with malformed coordinates are excluded. The output is a compact browser JSON file and a machine-readable `data_validation.json` audit.

## PCA

The five features are `log1p(departures)`, `log1p(distinct routes)`, morning share, evening share and rail-mode share. Each column is clipped to its 1st/99th percentile for PCA only, then z-standardized. NumPy SVD gives the scores. Signs are fixed to make PC1 positive for departure volume and PC2 positive for morning share. PC1 explains 36.616%, PC2 28.092%, or 64.708% combined. The other 35.292% is not shown. Raw counts, not clipped values, appear in comparison cards.

## Selection-triggered computation

Canvas pointer events define a screen rectangle. The app tests every stop's screen position and stores the matching row indexes in one `Set`. Both plots redraw using the same set. For selected and remaining groups, the app computes separate medians of scheduled departures per stop; the difference is selected minus remaining. It also aggregates the selected group's hourly departures, median route count and rail-mode share. A point click selects the nearest stop within nine screen pixels.

## Complexity and observed performance

Each selection scans at most 8,252 stops. Median sorting is O(n log n); redraw is O(n). A local headless Chrome run loaded the page and JSON in about 572 ms and completed two browser-driven brushes in 35 and 27 ms respectively on the test machine. These are measurements of one run, not guarantees across devices. Browser tests also checked a top-stop value against prepared source data, linked selection, clearing and JavaScript errors.

## Alternatives rejected

- t-SNE/UMAP could emphasize local clusters but yield less interpretable, less stable axes for the service-volume question.
- A server-side query service is unnecessary for this fixed-size snapshot and would add deployment requirements.
- A dynamic real-time comparison is outside this reproducible one-day analysis; a future system would need stored observations and missing-feed handling.
