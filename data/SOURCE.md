# Official GTFS snapshot

`rome_static_gtfs_2026-11-16.zip` was downloaded from [Roma Servizi per la Mobilità](https://romamobilita.it/sistemi-e-tecnologie/open-data/) on 16 November 2026. The upstream file is updated frequently; this dated local copy preserves the exact input for the paper.

SHA-256: `7c5c034c7dd83a2309bff091c9aefaec08a4dc8ddebbb07540a2f7762d89c111`

The file contains seven GTFS text tables: `agency`, `routes`, `shapes`, `trips`, `stop_times`, `stops` and `calendar_dates`. The project uses all except `shapes` and `agency`. The selected service day is Wednesday 18 November 2026, two days after this ZIP was downloaded. It is a published plan for a future date, not a record of service that had already happened. The source's posted schedule may not reflect actual service, and the source page cautions against interpreting operational information as an exhaustive record of service.

The feed lists planned service dates from 21 October through 23 December 2026. For the selected 18 November service day, qualifying scheduled departures range from 00:00:00 to 30:45:00 in GTFS notation; 30:45:00 corresponds to 06:45 on 19 November, and 53,582 qualifying departures have times at or after 24:00. The dashboard folds these into clock hours 00–06 but retains them in the 18 November service-day total.

The linked GTFS page makes the feed downloadable but does not state an explicit license for this ZIP. Confirm redistribution terms with the provider before making the source archive public. The project repository is currently private; derived statistics and figures cite the source above.
