# Data and task abstraction

## Data model

One row in the application is one GTFS `stop_id` active on **18 November 2026**. The script joins active `service_id` values from `calendar_dates.txt` to `trips.txt`, then joins trips to `stop_times.txt` and stops. `routes.txt` supplies route identities and modes. `departure_time` values after 24:00 are folded to clock hours 00–23 while remaining in the selected GTFS service day.

| Attribute | Type | Meaning |
| --- | --- | --- |
| Latitude, longitude | spatial coordinates | Published stop location |
| Scheduled departures | quantitative count | Stop-time records for active trips, excluding explicit no-pickup records |
| Distinct routes | quantitative count | Unique route IDs serving the stop |
| Morning, evening shares | quantitative ratio | Share of departures in 07–09 and 17–19 clock hours |
| Rail-mode share | quantitative ratio | Share on GTFS route types 0, 1 or 2 |
| Hourly distribution | 24-value series | Scheduled departures by clock hour |
| PC1, PC2 | derived coordinates | First two principal-component scores from five standardized features |

## Task abstraction

The system supports **locate, select, compare, summarize and characterize** tasks. The geographic view supports location selection; PCA supports profile selection. Both selections cause a fresh group-versus-rest median and time-profile computation. This is a user-driven analytical calculation, not merely a visibility filter.

## Ordered analysis path

| Step | Input available to the analyst | Task | Result |
| --- | --- | --- | --- |
| 1 | Mapped active stops and named busiest-stop list | Locate a region or named stop of interest | A geographic candidate group |
| 2 | Map brush and linked PCA highlights | Compare the group's profile positions | Evidence of whether service patterns are similar or mixed |
| 3 | Selected-versus-remaining medians, route context and hourly bars | Characterize the difference | A quantified departure contrast and time profile |
| 4 | PCA brush and reverse map highlight | Find where an unusual profile occurs | A spatial distribution for follow-up route analysis |

A planner or researcher performs all four steps. For example, brushing a low-PC1 region yields lower typical scheduled departure counts and then reveals where those stops lie; the system does not equate this with poor access because demand and connectivity are absent.

An independent geographic check uses straight-line distance from the Termini GTFS stop to group stops into radial bands. Median scheduled departures per stop decline from 195.5 in the 0–3 km band to 56 in the 20–60 km band. The [report figure](../report/figures/service_radius.png) also shows the within-band spread and hourly profiles. This is a descriptive check of the same one-day schedule; distance does not measure access or demand.

## Worked usage scenario and insight

Starting with the distance chart, the analyst selects the 0–3 km band. The input is the dated set of 8,252 active stops; the selection returns 840 stop IDs. The map shows that group's locations and the fixed PCA plot shows its mix of profiles. The computation reports a selected median of 195.5 scheduled departures per stop, compared with 96 for the 7,412 remaining stops; median distinct routes are three versus two. The analyst can then inspect the selected group's hourly bars and brush a PCA region to locate a narrower profile. These numbers describe this service date and support a route-level follow-up question, not a claim that central stops are more accessible or that distance causes the difference.

## Data quality and scope

The snapshot has 8,325 stops with valid bounded coordinates; 8,252 receive at least one scheduled departure on the selected date. It includes 38,558 active trips and 1,153,216 qualifying stop-time departures. Stop IDs, not physical station complexes, define the units. Platforms or nearby poles may therefore count separately. The app does not infer trips per person or travel-time accessibility.

## Alternatives considered

- A route-level row would simplify the overview but prevent local stop comparison.
- Counting all feed stops would mix scheduled stops with those inactive on the chosen date.
- A single total-departure feature would hide time and route diversity, which motivate the PCA view.
