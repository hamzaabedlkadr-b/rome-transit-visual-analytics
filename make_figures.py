"""Create publication figures from the frozen prepared Rome GTFS analysis."""
import json
import math
import statistics
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

ROOT = Path(__file__).resolve().parent
rows = json.loads((ROOT / "web/data/rome_transport.json").read_text())["rows"]
validation = json.loads((ROOT / "data_validation.json").read_text())
out = ROOT / "report/figures"
out.mkdir(parents=True, exist_ok=True)

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 9,
                     "axes.spines.top": False, "axes.spines.right": False,
                     "savefig.dpi": 220})

termini = next(row for row in rows if row["id"] == "05000")
def distance_km(row):
    lat0, lon0 = math.radians(termini["lat"]), math.radians(termini["lon"])
    lat1, lon1 = math.radians(row["lat"]), math.radians(row["lon"])
    a = math.sin((lat1-lat0)/2)**2 + math.cos(lat0)*math.cos(lat1)*math.sin((lon1-lon0)/2)**2
    return 2*6371*math.asin(math.sqrt(a))

bands = [(0,3), (3,6), (6,10), (10,20), (20,60)]
groups = [[row for row in rows if a <= distance_km(row) < b] for a,b in bands]
fig, ax = plt.subplots(1, 2, figsize=(10.8, 3.6), gridspec_kw={"width_ratios":[1.05,1]})
bp = ax[0].boxplot([[r["d"] for r in group] for group in groups],
                   positions=range(1,6), patch_artist=True, showfliers=False,
                   medianprops={"color":"black","linewidth":1.6},
                   whiskerprops={"color":"#666666"}, capprops={"color":"#666666"})
for box in bp["boxes"]:
    box.set(facecolor="#d3d3d3", edgecolor="#555555")
ax[0].set_yscale("log")
ax[0].set_ylim(4, 2000)
ax[0].set_xticks(range(1,6), [f"{a}–{b}\n(n={len(g):,})" for (a,b),g in zip(bands,groups)])
ax[0].set_ylabel("Scheduled departures per stop (log scale)")
ax[0].set_xlabel("Distance from Termini stop (km)")
ax[0].set_title("Typical scheduled volume declines with distance", loc="left", fontweight="bold")
ax[0].grid(axis="y", color="#e6e6e6", linewidth=.6)

central, outer = groups[0], groups[3]
for group, label, color, linestyle in [(central,"0–3 km from Termini","black","-"),
                                       (outer,"10–20 km from Termini","#777777","--")]:
    totals=np.array([sum(row["h"][h] for row in group) for h in range(24)])
    ax[1].plot(range(24), 100*totals/totals.sum(), color=color, linestyle=linestyle,
               linewidth=1.7, label=f"{label} (n={len(group):,})")
ax[1].set_xlim(0,23);ax[1].set_xticks([0,3,6,9,12,15,18,21,23])
ax[1].set_xlabel("Scheduled departure clock hour")
ax[1].set_ylabel("Share of group's daily departures (%)")
ax[1].set_title("Time profiles also differ", loc="left", fontweight="bold")
ax[1].grid(axis="y",color="#e6e6e6",linewidth=.6)
ax[1].legend(frameon=False,loc="lower center",fontsize=8)
fig.tight_layout(w_pad=2.2)
fig.savefig(out/"service_radius.pdf",bbox_inches="tight")
fig.savefig(out/"service_radius.png",bbox_inches="tight")
plt.close(fig)

feature_labels = ["Log departures", "Log routes", "Morning share", "Evening share", "Rail-mode share"]
feature_keys = validation["pca_features"]
loadings=np.array([validation["pca_loadings"][k] for k in feature_keys])
fig, axes=plt.subplots(1,2,figsize=(9.2,3.1),sharey=True)
for j, axis in enumerate(axes):
    vals=loadings[:,j]
    axis.barh(range(5),vals,color=["#333333" if v>=0 else "#aaaaaa" for v in vals],height=.62)
    axis.axvline(0,color="black",linewidth=.7)
    axis.set_yticks(range(5),feature_labels)
    axis.invert_yaxis()
    axis.set_xlim(-.8,.8)
    axis.set_xlabel("Loading on standardized feature")
    axis.set_title(f"PC{j+1} ({100*validation['pca_variance_ratio'][j]:.1f}% variance)",loc="left",fontweight="bold")
    axis.grid(axis="x",color="#e6e6e6",linewidth=.5)
    axis.set_axisbelow(True)
fig.tight_layout(w_pad=2)
fig.savefig(out/"pca_loadings.pdf",bbox_inches="tight")
fig.savefig(out/"pca_loadings.png",bbox_inches="tight")
plt.close(fig)

print({"radial_band_counts":[len(group) for group in groups],
       "radial_medians":[statistics.median(r["d"] for r in group) for group in groups],
       "termini_reference":{k:termini[k] for k in ("id","name","lat","lon")}})
