# Visual design and interaction

## Views and encoding

- **Map:** fixed longitude/latitude axes; each mark is an active stop. The view preserves geographic context and supports rectangle brush or point click. It does not use a basemap, avoiding a web-tile dependency and preventing contextual map detail from overwhelming the stop pattern.
- **PCA scatterplot:** the same stops positioned by PC1 and PC2. PC1 is oriented toward larger schedule volume and more routes; PC2 toward larger morning/evening shares. The axes are stable across selections. The caption states the explained variance.
- **Hourly bars:** selected group's clock-hour distribution. Tooltips give counts and shares. The chart recalculates after each visual selection.
- **Ranked named stops:** twelve stops with the largest scheduled departure counts. Labels and exact values support a concrete starting point; clicking selects the stop in both plots.
- **Comparison cards:** selected count, selected median departures per stop, remaining median and arithmetic difference, accompanied by route and rail-mode context. These numbers guard against treating a large dark region as a large effect.

Unselected points use muted tones and selected points use dark ink in both plots. The same selection meaning is kept across views. Text and position carry meaning; color alone is not required to distinguish the two groups.

## Interaction sequence

The user brushes a map region, sees its stops in PCA and reads the recomputed summary. Brushing a PCA region reverses the path, revealing geography. A point click supports named-stop inspection. Clear resets the selection. The shared `stop_id` index set is the sole selection state so views cannot disagree.

This implements Sacha et al.'s **data selection and emphasis** scenario for interaction with dimensionality reduction: the PCA coordinates are computed once, while selections made in either view emphasize the same records in the other. The [prototype capture](../prototype.png) is the current design mockup and the [paired-view figure](../report/coordinated_views.png) shows one PCA selection.

At a standard laptop width, the two large plots remain side by side so a rectangular brush is precise enough to inspect dense stops. The hourly profile and ranked stops follow below and can be reached with the page's named navigation links. This deliberate vertical flow keeps the linked plots large instead of squeezing four small charts into one viewport; the static research figures are separate evidence at the end. The user can return to the main plots with the navigation link or browser scroll.

## Alternatives rejected

- A choropleth would require area aggregation and hide individual stops, including adjacent stops with different service.
- Coloring every stop by departures would compete with the selection color. Exact selected-versus-rest values are placed in cards instead.
- Recomputing PCA after every brush would move the axes and make comparisons unstable.
- A raw network drawing would produce dense overlapping edges and answer a different connectivity task.

## Limits and next design review

Overplotting occurs at dense central stops and in PCA. The bars and point click partially mitigate it. A target-user walkthrough should test whether a zoom or density layer is needed. The static schedule and projection cannot support a claim about service reliability or rider benefit.
