# Q-Profit — Figma import files

Every `.html` file here is a **self-contained static export** of one Q-Profit screen,
made for importing into Figma (for example with the html.to.design plugin → *Import file*).

- All styles are inlined, every image (logos, icons, map tiles) is embedded as data,
  and there are no scripts — each file imports on its own, from any folder.
- Captured at 1440 px wide, light theme, navigation rail collapsed.
- Each persona's screens show exactly what that person sees: only their dashboards in
  the rail, and their locked filters (e.g. Mohammed's business unit, Yousef's division).
- Links between screens point at the neighbouring files, so the folder also works as a
  clickable offline prototype when opened in a browser.

## Structure

```
Figma/
├── 00-workspaces.html                      Workspaces directory (links into every persona)
├── design-system.html                      Design system reference
├── Persona 1 - Imran (Board of Director)/  01–07 · all seven dashboards
├── Persona 2 - Hala (Finance Manager)/     01–07 · all seven dashboards
├── Persona 3 - Mohammed (Business Unit Manager)/     03-business-units
├── Persona 4 - Yousef (Corporate Division Manager)/  05-corporate-divisions
├── Persona 5 - Reem (Operating Asset Lead)/          07-operating-assets
├── Persona 6 - Nasser (City Operations Lead)/        06-city-operations
├── Persona 7 - Sara (Corporate Auditor)/             04-corporate, 05-corporate-divisions
└── KPI Concepts/                           Imran's Consolidated with each KPI card concept
    ├── 00-current.html
    ├── 01-bullet.html
    ├── 02-ring.html
    ├── 03-plan-forecast.html
    └── 04-scorecard.html
```

Dashboard files keep the same number in every persona folder:
01 Consolidated · 02 Development · 03 Business Units · 04 Corporate ·
05 Corporate Divisions · 06 City Operations · 07 Operating Assets.

**Fonts:** the screens use Proxima Nova. Activate it in Figma (Adobe Fonts via Creative
Cloud, or an installed copy) before importing, otherwise Figma substitutes a fallback font.

**These are snapshots.** They don't update when the dashboards change. The working
product stays in `Live/`; regenerate this folder after design changes.

Do not import the files under `Live/Persona …/` — those are only redirects to the
live app and contain no screen content.
