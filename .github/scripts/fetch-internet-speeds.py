#!/usr/bin/env python3
"""
Fetch internet speed data for nomad cities from Ookla Open Data.

Downloads Ookla's quarterly fixed-broadband speed tiles (Parquet),
extracts tile centroids from WKT POLYGON geometry,
spatial-joins them to our 95 cities by lat/lon (15km radius),
and writes the results into public/nomad-cities.json.

Data source: https://github.com/teamookla/ookla-open-data
License: CC BY-NC-SA 4.0
"""

import json
import os
import re
import sys
import urllib.request
from math import radians, cos, sin, sqrt, atan2

# ── Config ──────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.join(SCRIPT_DIR, '..', '..')
CITIES_FILE = os.path.join(REPO_ROOT, 'public', 'nomad-cities.json')
RADIUS_KM = 15

OOKLA_URL = (
    'https://ookla-open-data.s3.amazonaws.com/'
    'parquet/performance/type%3Dfixed/year%3D2026/quarter%3D1/'
    '2026-01-01_performance_fixed_tiles.parquet'
)
QUARTER = '2026-Q1'


def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def download_ookla(dest_path):
    print(f'📥 Downloading Ookla data ({QUARTER})...')
    print(f'   This may take a few minutes (~330MB)...')
    req = urllib.request.Request(OOKLA_URL)
    resp = urllib.request.urlopen(req)
    total = int(resp.headers.get('Content-Length', 0))
    downloaded = 0
    with open(dest_path, 'wb') as f:
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                print(f'\r   Progress: {downloaded / 1024 / 1024:.0f}/{total / 1024 / 1024:.0f} MB ({downloaded / total * 100:.0f}%)', end='', flush=True)
    print(f'\n   ✅ Downloaded {downloaded / 1024 / 1024:.1f} MB')


def wkt_centroid(wkt):
    """Extract centroid (lon, lat) from WKT POLYGON string."""
    # POLYGON((lon1 lat1, lon2 lat2, ...))
    coords_str = wkt[wkt.index('((')+2 : wkt.index('))')]
    pairs = coords_str.split(',')
    # Use first two corners to get center (faster than averaging all points)
    p1 = pairs[0].strip().split()
    p2 = pairs[2].strip().split()
    lon = (float(p1[0]) + float(p2[0])) / 2
    lat = (float(p1[1]) + float(p2[1])) / 2
    return lat, lon


def process_cities(parquet_path):
    import pyarrow.parquet as pq
    import pandas as pd

    with open(CITIES_FILE) as f:
        cities = json.load(f)

    print(f'🏙️  Processing {len(cities)} cities...')
    print('📊 Reading Parquet file...')
    table = pq.read_table(parquet_path, columns=[
        'avg_d_kbps', 'avg_u_kbps', 'avg_lat_ms', 'tests', 'tile'
    ])
    df = table.to_pandas()
    print(f'   Loaded {len(df):,} tiles worldwide')

    # Extract centroids from WKT POLYGON
    print('🗺️  Extracting tile centroids from WKT geometry...')
    lats = []
    lons = []
    for i, wkt in enumerate(df['tile']):
        try:
            lat, lon = wkt_centroid(wkt)
            lats.append(lat)
            lons.append(lon)
        except:
            lats.append(0)
            lons.append(0)
        if i % 500000 == 0 and i > 0:
            print(f'   Processed {i:,}/{len(df):,} tiles...')

    df['lat'] = lats
    df['lon'] = lons
    print(f'   ✅ Extracted {len(df):,} centroids')

    # Spatial join each city
    DELTA = 0.15  # ~15km bounding box
    print('🔍 Matching tiles to cities...')

    for city in cities:
        clat, clon = city['lat'], city['lon']

        # Bounding box pre-filter
        mask = (
            (df['lat'] >= clat - DELTA) & (df['lat'] <= clat + DELTA) &
            (df['lon'] >= clon - DELTA) & (df['lon'] <= clon + DELTA)
        )
        nearby = df[mask]

        if len(nearby) == 0:
            print(f'   ⚠️  {city["name"]}: no tiles found, expanding search...')
            # Try larger radius
            mask2 = (
                (df['lat'] >= clat - 0.3) & (df['lat'] <= clat + 0.3) &
                (df['lon'] >= clon - 0.3) & (df['lon'] <= clon + 0.3)
            )
            nearby = df[mask2]

        if len(nearby) == 0:
            print(f'   ❌ {city["name"]}: no data available')
            city['internet'] = {
                'download_mbps': 0, 'upload_mbps': 0, 'latency_ms': 0,
                'test_count': 0, 'quarter': QUARTER,
            }
            continue

        # Refine with haversine
        distances = nearby.apply(
            lambda r: haversine(clat, clon, r['lat'], r['lon']), axis=1
        )
        within = nearby[distances <= RADIUS_KM]
        if len(within) == 0:
            within = nearby  # fall back to bounding box

        total_tests = within['tests'].sum()
        if total_tests == 0:
            total_tests = 1

        download = round((within['avg_d_kbps'] * within['tests']).sum() / total_tests / 1000, 1)
        upload = round((within['avg_u_kbps'] * within['tests']).sum() / total_tests / 1000, 1)
        latency = round((within['avg_lat_ms'] * within['tests']).sum() / total_tests)

        city['internet'] = {
            'download_mbps': download,
            'upload_mbps': upload,
            'latency_ms': int(latency),
            'test_count': int(total_tests),
            'quarter': QUARTER,
        }

        quality = '🟢' if download >= 50 else '🟡' if download >= 25 else '🔴'
        print(f'   {quality} {city["name"]}: ↓{download} ↑{upload} Mbps, {latency}ms, {int(total_tests):,} tests ({len(within)} tiles)')

    return cities


def main():
    cache_dir = os.path.join(REPO_ROOT, '.github', 'scripts')
    parquet_path = os.path.join(cache_dir, 'ookla-fixed-2026q1.parquet')

    if not os.path.exists(parquet_path):
        download_ookla(parquet_path)
    else:
        size_mb = os.path.getsize(parquet_path) / 1024 / 1024
        print(f'📦 Using cached Parquet ({size_mb:.0f} MB)')

    cities = process_cities(parquet_path)

    with open(CITIES_FILE, 'w') as f:
        json.dump(cities, f, indent=2, ensure_ascii=False)

    print(f'\n✅ Updated {CITIES_FILE} with internet speed data for {len(cities)} cities')

    speeds = [c['internet']['download_mbps'] for c in cities if c.get('internet', {}).get('download_mbps', 0) > 0]
    if speeds:
        print(f'📊 Speed summary: min={min(speeds)}, max={max(speeds)}, avg={sum(speeds)/len(speeds):.1f} Mbps')
        fast = len([s for s in speeds if s >= 50])
        mid = len([s for s in speeds if 25 <= s < 50])
        slow = len([s for s in speeds if s < 25])
        print(f'   🟢 Fast (50+ Mbps): {fast} cities')
        print(f'   🟡 Medium (25-50 Mbps): {mid} cities')
        print(f'   🔴 Slow (<25 Mbps): {slow} cities')


if __name__ == '__main__':
    main()
