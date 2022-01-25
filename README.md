# Analytics for Scream protocol.

## Notes

- `FTMSCAN_API_KEY` is a required env var in order to fetch buybacks
- when adding a new market, add an image for the token under `/public/images/tokens`
- buybacks are currently hardcoded to a specific `from` address (found in `utils/index.tsx`)
- custom style is almost entirely handled in `globals.css` via Tailwind
- `react-table` throws a warning about duplicate `key`s => this is an issue with the library and can be ignored for now
- maths are done primarily in JS native Numbers. This is fine for now, but if unusual results come up, it may be time to convert to BigNumber math

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
