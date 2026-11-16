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

## Data quality and scope

The snapshot has 8,325 stops with valid bounded coordinates; 8,252 receive at least one scheduled departure on the selected date. It includes 38,558 active trips and 1,153,216 qualifying stop-time departures. Stop IDs, not physical station complexes, define the units. Platforms or nearby poles may therefore count separately. The app does not infer trips per person or travel-time accessibility.

## Alternatives considered

- A route-level row would simplify the overview but prevent local stop comparison.
- Counting all feed stops would mix scheduled stops with those inactive on the chosen date.
- A single total-departure feature would hide time and route diversity, which motivate the PCA view.
