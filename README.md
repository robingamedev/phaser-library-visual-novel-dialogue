# Visual Novel Dialogue

A minimal, JSON-driven dialogue plugin for Phaser 3 games with support for branching choices, typewriter effects, and simple inline formatting.

## Features

- 🧾 JSON-based dialogue scripting
- 💬 Character nameplates with color tags
- 🧠 Label-based branching via `jump`
- 🎭 Player choices
- ⏳ Typewriter text effect
- 🎨 Simple inline styling with `{style=value}`
- 🧰 Global config for fonts, box style, and speed
- 🔌 Exposed API for `jumpTo`, `pause`, and hooks
- 🔊 Inline audio triggers with `{audio=value}{/audio}` tags

## Installation

```bash
npm install @robingamedev/visual-novel-dialogue
```

## Quick Start

```ts
import VisualNovelDialogue from '@robingamedev/visual-novel-dialogue';

const dialogue = new VisualNovelDialogue(this, {
  fontFamily: 'VT323',
  typeSpeed: 30,
  boxStyle: 'default',
  autoForward: false,
});

dialogue.load('dialogue.json');
dialogue.start('Start');
```

## Documentation

- **[Overview](.cursor/rules/overview.mdc)** - Plugin architecture and design
- **[Usage Guide](.cursor/rules/usage.mdc)** - Setup, API, and integration examples
- **[JSON Format](.cursor/rules/json-format.mdc)** - Dialogue file structure and commands
- **[Status & Changelog](.cursor/rules/status.mdc)** - Version history and development progress

## License

MIT

---

Built for small teams, hobbyists, and story-heavy games. 