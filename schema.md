# Data schema (v4)

Three editable data files in `/data`:

- `people.js` — cast list (your master list)
- `places.js` — locations
- `chapters.js` — source of truth for per-chapter mentions (people weights, places presence)

## People (`data/people.js`)
```js
{
  id: "krishna",                 // required slug; used in chapters.mentions.people
  name: "Kṛṣṇa",
  aka: ["Krishna","Vāsudeva"],   // optional
  role: "deity",                 // optional (king/prince/deity/etc). Not shown by default.
  desc: "Short bio…",            // optional
  first_appearance: { chapter: 23, order: 5 }, // manual global order for sorting (pre-filled minimally)
  // Life-cycle (either one-off death OR full timeline):
  death: { chapter: 58, note: "Slain in war." }, // optional, one-off
  life_events: [                                // optional timeline (overrides death)
    { type: "death",   chapter: 58, note: "Fell in battle" },
    { type: "revival", chapter: 60, note: "Revived by boon" }
  ],
  avatar: "krishna.jpg"           // optional manual filename
}
```

## Places (`data/places.js`)
Presence-only mentions; same schema as v3 with `first_appearance` for sorting.

## Chapters (`data/chapters.js`)
People weights: `major | significant | minor`. Places are presence-only.

## Sorting
- Characters: relevance (current chapter weights) → first appearance → A–Z
- Places: in current chapter → first appearance → A–Z

## “So far”
At chapter *N*, the grids show the union of mentions from chapters `1..N`.

## Images
Looks in `Avatars/` & `Places/` with multi-extension attempts; shows letter fallback if not found.


## New in v4b

### In‑chapter highlighting
Any character or place mentioned in the **current** chapter is visually highlighted (blue ring). No toggle needed.

### Chapter notes
Add optional chapter‑specific notes for people and places directly in `data/chapters.js`:

```js
{
  id: 5,
  // …
  notes: {
    people: {
      "karna": "Crowned king of Aṅga by Duryodhana during the exhibition."
    },
    places: {
      "hastin_pura": "Kuru capital; scene of the exhibition crowd."
    }
  }
}
```
Notes render on the corresponding cards only when viewing that chapter.


## v5 additions
- Robust image filename matching (adds transliteration so names like “Bhīṣma” match `bhishma_avatar.jpg`). You can also set `avatar: "bhishma_avatar.jpg"` on any person/place.
- Inline editing:
  - **Characters/Places:** role & description (people), chapter notes (people/places).
  - **Chapters:** title, summary, and events (one per line) via the editor under the chapter slider (enabled in Edit mode).
- Hover previews: names in **Summary** or **Events** are linkified to a mini preview of that person/place. Click to scroll to their card.
- Death/resurrection timeline: the **Deceased** badge shows a tooltip like “Slain by Arjuna — Chapter 4” based on the latest death event ≤ the current chapter.
