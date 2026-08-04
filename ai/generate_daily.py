#!/usr/bin/env python3
"""Generate and publish a fresh Learning Cave daily pack.

The native Android UI is versioned with the APK. Daily runs must only generate
content; they must never rewrite application source code.
"""
from generate_daily_v13 import main


if __name__ == "__main__":
    main()
