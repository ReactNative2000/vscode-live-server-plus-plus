#!/usr/bin/env python3
import json
import sys
import os

REPORT_PATH = 'lighthouse/report.report.json'

def main():
    if not os.path.exists(REPORT_PATH):
        print('Lighthouse report not found; skipping threshold checks')
        return 0
    with open(REPORT_PATH, 'r') as f:
        report = json.load(f)
    categories = report.get('categories', {})
    scores = {k: int(round(v.get('score', 0) * 100)) for k, v in categories.items()}
    print('Lighthouse scores:', scores)

    # Default thresholds (can be tuned)
    thresholds = {
        'performance': 50,
        'accessibility': 70,
        'best-practices': 60,
        'seo': 50,
    }

    failures = []
    for k, t in thresholds.items():
        s = scores.get(k, 0)
        print(f'{k}: {s} (threshold {t})')
        if s < t:
            failures.append((k, s, t))

    if failures:
        print('Thresholds not met:')
        for k, s, t in failures:
            print(f'- {k}: {s} < {t}')
        return 2

    print('All thresholds met')
    return 0

if __name__ == '__main__':
    sys.exit(main())
