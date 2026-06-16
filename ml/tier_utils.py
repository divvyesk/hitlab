"""Shared tier bucketing for HitLab training and inference."""

from __future__ import annotations


def create_hit_tier(weeks: int) -> int:
    if weeks <= 2:
        return 1
    if weeks <= 4:
        return 2
    return 3
