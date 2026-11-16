# 18-minute exam presentation and live demo

This is a speaking plan, not a claim that course approval or user evaluation has happened. Aim for 9 slides and leave about 2 minutes of a 20-minute slot for transitions.

| Slide | Time | Main point | Show |
| --- | ---: | --- | --- |
| 1. Question | 1 min | Where is published service concentrated, and how do stop profiles differ? | Title and one Rome map screenshot |
| 2. Users and tasks | 2 min | Planner/researcher: locate, compare, characterize, reverse lookup | Three concrete tasks |
| 3. Source and scope | 2 min | Official static GTFS snapshot, one Wednesday, 8,252 active stops | Data flow from service IDs through stop times |
| 4. Design | 2 min | Map and PCA share stop selection; summary recalculates | Annotated coordinated-views figure |
| 5. PCA choices | 2 min | Five standardized features; 64.71% retained in two axes | Loadings and variance table |
| 6. Live demo | 4 min | Brush map, inspect PCA and hourly profile; brush PCA, return to geography | Running dashboard |
| 7. Findings | 2 min | PLEBISCITO has 2,298 scheduled stop departures; PC1 separates schedule volume; PC2 differs in time profile | Counts and selected-versus-rest example |
| 8. Geographic check | 2 min | Scheduled service tends to decline with distance from Termini, though group distributions overlap | Radial boxplots and hourly profiles |
| 9. Validation and limits | 1 min | Automated browser checks; no observed punctuality or ridership; user walkthrough pending | Validation and limitation list |

## Live-demo sequence

1. Open `web/` and explain one dot equals one active `stop_id`.
2. Click PLEBISCITO in the ranked list. Read its name, 2,298 scheduled departures and location in both plots.
3. Clear; brush a geographic region. Point to the highlighted PCA profile and compare median departures and hourly distribution.
4. Brush a PCA region. Read its selected-versus-remaining difference, then locate the group on the map.
5. State the limit: these are published stop-time records for one date, not measured vehicle arrivals or riders.

## Likely examiner questions

- **Why PCA?** It gives stable, interpretable axes for five correlated stop-level features; PC1 loads on volume and route count. It leaves 35.29% of variance outside the plot.
- **Why use medians?** Extreme hubs skew mean departures; median describes a typical stop in each selected group.
- **What does a stop departure mean?** One eligible active-trip `stop_times.txt` row at a stop, assigned to its scheduled clock hour. It is not a passenger trip.
- **What does brushing compute?** It rebuilds selected and remaining groups, computes both medians and their difference, then aggregates the selected group's hourly distribution and route/mode context.
- **What is missing?** Observed arrivals, cancellations, demand, population, route transfer connectivity and target-user feedback.
