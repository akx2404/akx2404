#!/usr/bin/env python3
"""Compatibility entry point for older GitHub Actions reruns.

The active product no longer generates images. Older workflow attempts still
invoke this filename, so delegate to the V9 Cave Keeper dialogue generator.
"""
from generate_daily_keeper import main

if __name__ == "__main__":
    main()
