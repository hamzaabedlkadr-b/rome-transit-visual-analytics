# Visual design and interaction

## Views and encoding

Seven views share one selection (a set of stop indexes). Every view can **set** the selection and every view **shows** it, so coordination is bidirectional for every pair of views.

| View | Sets the selection by | Shows the selection as |
| --- | --- | --- |
| 01 Map | rectangle brush or stop click | dark stop marks on fixed longitude/latitude axes |
| 02 PCA | rectangle brush or stop click | dark stop marks on fixed PC1/PC2 axes |
| 03 Hourly profile | dragging clock hours: stops whose busiest scheduled hour is in the range | selection's share of departures per hour beside all stops |
| 04 Departures per stop | dragging logarithmic count bins | share of the selection's stops per bin beside all stops |
| 05 Routes per stop | dragging route-count bins | as view 04 |
| 06 Distance from Termini | dragging distance bands | as view 04 |
| 07 Ranked busiest stops | clicking a named stop | the twelve busiest stops inside the selection |

- **Map** keeps geographic context without a basemap, avoiding a web-tile dependency and contextual clutter.
- **PCA** axes are computed once and stay fixed across selections; PC1 is oriented toward larger volume and more routes, PC2 toward larger morning/evening shares.
- **Bar views 03–06** are grouped bars: light = all stops, dark = selection, each as a share of its own group, so a 30-stop selection is comparable with 8,252 stops. Tooltips give counts and shares. The brushed bins stay outlined in gold until another view takes over.
- **Hour brushing** selects by each stop's busiest scheduled hour (ties go to the earliest hour). The bars themselves are departure shares; the caption states this difference.
- **Ranked list** shows the busiest stops inside the current selection (citywide when nothing is selected).
- **Comparison cards** give selected count, selected and remaining median departures per stop and their difference, plus median routes, rail share and median distance from Termini.

Unselected points use muted tones and selected points use dark ink in both plots. The same selection meaning is kept across views. Text and position carry meaning; color alone is not required to distinguish the two groups.

## Interaction sequence

The user brushes a map region, sees its stops in PCA and in the four distributions, and reads the recomputed summary. Brushing a PCA region reverses the path, revealing geography. Brushing a distribution (an hour range, a departure or route bin, a distance band) starts from one attribute and shows where those stops are and how they differ on the others. A new selection replaces the previous one; the status line names the view and range that produced it. Clear resets the selection. The shared stop-index set is the sole selection state so views cannot disagree.

This implements Sacha et al.'s **data selection and emphasis** scenario for interaction with dimensionality reduction: the PCA coordinates are computed once, while selections made in either view emphasize the same records in the other. The [prototype capture](../prototype.png) is the current design mockup and the [paired-view figure](../report/coordinated_views.png) shows one PCA selection.

At a standard laptop width, the two large plots remain side by side so a rectangular brush is precise enough to inspect dense stops. The four distribution charts follow in a 2×2 grid and the ranked list below them, reachable with the page's navigation links. This vertical flow keeps the scatterplots large instead of squeezing seven charts into one viewport; the static research figures are separate evidence at the end. The user can return to the main plots with the navigation link or browser scroll.

## Alternatives rejected

- A choropleth would require area aggregation and hide individual stops, including adjacent stops with different service.
- Coloring every stop by departures would compete with the selection color. Exact selected-versus-rest values are placed in cards instead.
- Recomputing PCA after every brush would move the axes and make comparisons unstable.
- Filtering unselected stops out of the bar views would remove the all-stops baseline the selection is read against.
- Intersecting successive brushes (crossfilter) was not adopted: replace-on-select keeps one clear selection origin, named in the status line.
- A raw network drawing would produce dense overlapping edges and answer a different connectivity task.

## Limits and next design review

Overplotting occurs at dense central stops and in PCA. The bars and point click partially mitigate it. A target-user walkthrough should test whether a zoom or density layer is needed. The static schedule and projection cannot support a claim about service reliability or rider benefit.

An automated browser walkthrough exercised map, PCA, each distribution and the ranked list as selection sources. It verified that the six other views reflected each selection, the top-stop value matched prepared data, and clearing worked without JavaScript errors. This is an implementation check, not evidence that the intended users understand the interface. No target-user session has occurred.
