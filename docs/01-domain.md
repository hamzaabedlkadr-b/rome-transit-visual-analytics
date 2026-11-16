# Domain analysis

## Context and intended users

The intended users are Rome transit planners and transport researchers who want to examine the *published supply* of service across stops. A schedule can identify high-volume hubs, differences in route diversity and distinctive time profiles. It cannot measure whether vehicles arrived as planned, whether a rider could board, or whether a neighbourhood has equitable access. Those questions require additional data.

This user definition and the task priorities are assumptions derived from the feed's available fields and the course's requirement for an exploratory analysis; no planner or researcher has been interviewed. A walkthrough with one such user would test whether comparing stop-level supply and returning from profile to geography fits a real workflow.

## Questions and tasks

1. **Locate:** Where are high- and low-volume scheduled stops? Which named stops deserve closer inspection?
2. **Compare:** For a selected geographic area or service-profile group, how does median scheduled departures per stop compare with the remaining stops?
3. **Characterize:** Does the selected group concentrate departures in morning, evening or throughout the day? Does it include many routes or rail-mode service?
4. **Reverse lookup:** Where are stops with an unusual multivariate profile located?

The user starts from a map region, a PCA region or a named busy stop, then compares the linked highlights and computed summary. The resulting differences are descriptive; they are not a causal explanation of service allocation.

## Alternatives considered

- A live-vehicle dashboard would address punctuality, but the GTFS real-time feed changes about every minute and a one-time capture is not a defensible reliability estimate. The static schedule gives a reproducible first analysis.
- A route network study could examine connectivity, but it requires route geometry and transfer rules beyond the scope of the initial stop-profile question. A later extension can add those.
- The earlier rental-listing idea was dropped after the project direction changed to Rome transport. It is archived outside this project.

## Validation still needed

The source and questions are grounded in the official feed. A conversation with an actual target user is still needed to establish whether these tasks match their workflow. No such conversation is claimed here.
