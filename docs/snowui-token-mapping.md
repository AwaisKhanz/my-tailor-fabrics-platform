# SnowUI Token Mapping

## Theme Contract
- `--background`: SnowUI light canvas (`#f7f9fb`) and dark app backdrop.
- `--foreground`: SnowUI black (`#1c1c1c`) in light mode and near-white in dark mode.
- `--card` / `--popover`: elevated white/light-dark surfaces for blocks, dialogs, menus, and content panes.
- `--primary`: strict SnowUI primary behavior.
  - Light: SnowUI black.
  - Dark: SnowUI Purple B.
- `--secondary`: SnowUI Purple soft surface.
- `--muted`: SnowUI Blue soft surface.
- `--accent`: SnowUI hover/segmented surface aligned to the purple-tinted surface family.
- `--destructive`: SnowUI red.
- `--border` / `--input`: neutral SnowUI border line.
- `--ring`: focus ring derived from SnowUI Purple A in light mode and SnowUI Blue B in dark mode.
- `--sidebar*`: same family as the main surface contract, but tuned for persistent navigation chrome.

## Static SnowUI Palette
- `snow.black`: `#1c1c1c`
- `snow.light`: `#f7f9fb`
- `snow.blue`: `#e3f5ff`
- `snow.purple`: `#e5ecf6`
- `snow.purple-a`: `#95a4fc`
- `snow.purple-b`: `#c6c7f8`
- `snow.blue-a`: `#a8c5da`
- `snow.blue-b`: `#b1e3ff`
- `snow.green-a`: `#a1e3cb`
- `snow.green-b`: `#baedbd`
- `snow.yellow`: `#ffe999`
- `snow.red`: `#ff4747`

## Usage Rules
- Shared primitives own all visual styling first. Route components should compose primitives instead of recreating surfaces.
- Dashboard shell styling is limited to layout chrome, navigation, search, and modal backdrop behavior.
- Success, info, warning, and destructive states come from the static SnowUI palette, not ad hoc Tailwind defaults.
- Typography is Inter-first through Tailwind `font-sans` and `font-ui`.
- Corner radii follow SnowUI’s 4px grid with 16px, 20px, 24px, 28px, and 32px used deliberately by component role.
