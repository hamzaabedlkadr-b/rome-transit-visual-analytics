"""Prepare one reproducible Rome GTFS service day for the visual analytics app."""
import csv
import io
import json
import math
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent
FEED = ROOT / "data/rome_static_gtfs_2026-11-16.zip"
SERVICE_DATE = "20261118"  # ordinary Wednesday in this downloaded feed
FEATURES = ["log_departures", "log_routes", "morning_share", "evening_share", "rail_share"]


def read_table(archive, name):
    with archive.open(name) as stream:
        yield from csv.DictReader(io.TextIOWrapper(stream, encoding="utf-8-sig", newline=""))


with zipfile.ZipFile(FEED) as archive:
    services = {r["service_id"] for r in read_table(archive, "calendar_dates.txt")
                if r["date"] == SERVICE_DATE and r["exception_type"] == "1"}
    services -= {r["service_id"] for r in read_table(archive, "calendar_dates.txt")
                 if r["date"] == SERVICE_DATE and r["exception_type"] == "2"}
    if not services:
        raise ValueError("Selected service date is absent from calendar_dates.txt")

    routes = {r["route_id"]: {"name": r["route_short_name"], "type": r["route_type"]}
              for r in read_table(archive, "routes.txt")}
    trips = {r["trip_id"]: r["route_id"] for r in read_table(archive, "trips.txt")
             if r["service_id"] in services and r["route_id"] in routes}
    stops = {}
    malformed_stops = 0
    for r in read_table(archive, "stops.txt"):
        try:
            lat, lon = float(r["stop_lat"]), float(r["stop_lon"])
            if not (41.60 <= lat <= 42.15 and 12.10 <= lon <= 12.85):
                continue
        except (ValueError, KeyError):
            malformed_stops += 1
            continue
        stops[r["stop_id"]] = {"id": r["stop_id"], "name": r["stop_name"],
                               "lat": lat, "lon": lon}

    profiles = defaultdict(lambda: {"hours": [0] * 24, "routes": set(), "types": Counter()})
    active_stop_times = 0
    excluded_no_pickup = 0
    for r in read_table(archive, "stop_times.txt"):
        route_id = trips.get(r["trip_id"])
        stop_id = r["stop_id"]
        if route_id is None or stop_id not in stops:
            continue
        if r.get("pickup_type") == "1":
            excluded_no_pickup += 1
            continue
        try:
            hour = int(r["departure_time"].split(":", 1)[0]) % 24
        except (ValueError, IndexError):
            continue
        profile = profiles[stop_id]
        profile["hours"][hour] += 1
        profile["routes"].add(route_id)
        profile["types"][routes[route_id]["type"]] += 1
        active_stop_times += 1

rows = []
for stop_id, profile in profiles.items():
    hours = profile["hours"]
    total = sum(hours)
    if total == 0:
        continue
    unique_routes = len(profile["routes"])
    rail = sum(profile["types"][key] for key in ("0", "1", "2"))
    row = {**stops[stop_id], "departures": total, "routes": unique_routes,
           "morning": sum(hours[7:10]), "evening": sum(hours[17:20]),
           "rail": rail, "hours": hours}
    rows.append(row)
rows.sort(key=lambda r: r["id"])

matrix = np.array([[math.log1p(r["departures"]), math.log1p(r["routes"]),
                    r["morning"] / r["departures"], r["evening"] / r["departures"],
                    r["rail"] / r["departures"]] for r in rows])
lo, hi = np.quantile(matrix, [0.01, 0.99], axis=0)
clipped = np.clip(matrix, lo, hi)
standardized = (clipped - clipped.mean(axis=0)) / clipped.std(axis=0)
u, singular, vt = np.linalg.svd(standardized, full_matrices=False)
coordinates = u[:, :2] * singular[:2]
loadings = vt[:2].copy()
if loadings[0, 0] < 0:
    loadings[0] *= -1
    coordinates[:, 0] *= -1
if loadings[1, 2] < 0:
    loadings[1] *= -1
    coordinates[:, 1] *= -1
variance = (singular ** 2) / sum(singular ** 2)
for row, point in zip(rows, coordinates):
    row["pc1"], row["pc2"] = round(float(point[0]), 4), round(float(point[1]), 4)

out_rows = [{"id": r["id"], "name": r["name"], "lat": r["lat"], "lon": r["lon"],
             "d": r["departures"], "r": r["routes"], "m": r["morning"],
             "e": r["evening"], "rail": r["rail"], "h": r["hours"],
             "pc1": r["pc1"], "pc2": r["pc2"]} for r in rows]
validation = {"source": "Roma Servizi per la Mobilità, static GTFS downloaded 2026-11-16",
              "source_url": "https://romamobilita.it/sistemi-e-tecnologie/open-data/",
              "service_date": "2026-11-18", "active_service_ids": len(services),
              "active_trips": len(trips), "source_stops_with_valid_coordinates": len(stops),
              "malformed_coordinate_stops": malformed_stops, "active_stops": len(rows),
              "active_stop_departures": active_stop_times,
              "excluded_no_pickup_stop_times": excluded_no_pickup,
              "scheduled_departures_per_stop_median": float(np.median([r["departures"] for r in rows])),
              "scheduled_departures_per_stop_max": max(r["departures"] for r in rows),
              "unique_routes_active": len({route for p in profiles.values() for route in p["routes"]}),
              "pca_features": FEATURES,
              "pca_variance_ratio": [round(float(v), 6) for v in variance],
              "pca_loadings": {f: [round(float(loadings[0, j]), 4), round(float(loadings[1, j]), 4)]
                               for j, f in enumerate(FEATURES)},
              "interpretation": "Scheduled service, not observed arrivals, reliability, ridership or accessibility."}
(ROOT / "web/data").mkdir(parents=True, exist_ok=True)
(ROOT / "web/data/rome_transport.json").write_text(json.dumps({"rows": out_rows,
    "variance": validation["pca_variance_ratio"], "date": validation["service_date"]}, separators=(",", ":")))
(ROOT / "data_validation.json").write_text(json.dumps(validation, indent=2) + "\n")
print(json.dumps(validation, indent=2))
