Analytics for Scream protocol.

Mocks:
useful if working offline, subgraph is down, or if needed for testing.

Contexts:

- GlobalContext
  for things that all pages on the app should have access to
- MarketContext
  for providing snapshots of the markets currently and yesterday. Snapshot of yesterday is necessary to provide the percent changes we see across the app

Utils:

- index
  currently used for fetching any external data
- Market
  here you'll find utility functions for market data (formatting, transforming) and types related to markets -- we have an interface for each Market query to ensure full type safety.
