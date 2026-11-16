# Proposal: Exploring scheduled transit service in Rome

**Student:** Hamza Abdul Kader (solo); GitHub `hamzaabedlkadr-b`  
**Status:** Draft for course proposal issue. Course approval is pending.

**Dataset and domain.** Roma Servizi per la Mobilità publishes a frequently updated static GTFS timetable for Rome. The 16 November 2026 download includes stops, routes, trips, stop times and calendar dates. We select Wednesday 18 November 2026 and derive scheduled departures and route diversity for each active stop. This is a measure of published service supply, not observed vehicle operation or passenger demand.

**Intended users and questions.** A transit planner or transport researcher can inspect where stops with high scheduled departure counts are located, whether stops with similar daily counts have different morning/evening patterns, and where unusual service profiles occur. Comparisons are exploratory and should lead to closer route-level examination rather than policy conclusions from one schedule date.

**Proposed system.** A geographic stop view and a PCA view of five stop-level service features share a selection. Brushing either view highlights the same stops in the other. Every selection recomputes median scheduled departures for selected versus remaining stops and an hourly departure profile. Ranked busiest-stop bars offer a named entry point. The projection provides a route back from an unusual multivariate profile to its location.

**Implementation note.** The working prototype later expanded this plan to seven coordinated selection sources. The current views and reasons for them are recorded in `docs/03-design.md`; this proposal remains a draft until the course reviews it.

**Evaluation plan.** Reconcile counts against the GTFS tables; verify linked brushing and median calculations in a browser; measure load and interaction time; conduct a walkthrough with a potential user and record how the design changed. Document limitations of the timetable and PCA.

**Source:** [Roma Servizi per la Mobilità open data](https://romamobilita.it/sistemi-e-tecnologie/open-data/), static GTFS download 16 November 2026. Definitions follow the [GTFS Schedule Reference](https://gtfs.org/documentation/schedule/reference/).
