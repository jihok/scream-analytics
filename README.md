# Analytics for Scream protocol.

## Notes

- `FTMSCAN_API_KEY` is a required env var
- buybacks are currently hardcoded to a specific `from` address

## Contexts:

GlobalContext

- for things that all pages on the app should have access to
- for providing snapshots of the markets currently and yesterday. Snapshot of yesterday is necessary to provide the percent changes we see across the app

## Utils:

- index
  currently used for fetching any external data (gecko, ftmscan)
- Market
  utility functions for market data (formatting, transforming) and types related to markets -- we have an interface for each Market query to ensure full type safety.
- Account
  utility functions for Account data (transforms, health score comput) and types related to Account

## Mocks:

useful if working offline, subgraph is down, or if needed for testing.
