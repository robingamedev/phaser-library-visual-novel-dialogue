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

// Initialize the dialogue system
const dialogue = new VisualNovelDialogue(this, {
  fontFamily: 'VT323',
  typeSpeed: 30,
  boxStyle: 'default',
  autoForward: false,
});

// Load your dialogue data
dialogue.load(dialogueData);

// Start the dialogue
dialogue.start('Start');

// Handle events
dialogue.onChoice = (label, text) => {
  console.log(`Player chose: ${text}`);
};

dialogue.onEnd = () => {
  console.log('Dialogue finished!');
};
```

## Basic Usage

### 1. Create Dialogue Data

```json
{
  "settings": {
    "characters": {
      "alice": { "name": "Alice", "color": "#ff6b6b" },
      "bob": { "name": "Bob", "color": "#4ecdc4" }
    }
  },
  "script": {
    "Start": [
      "alice Hello there!",
      "bob Hi Alice!",
      {
        "Choice": {
          "continue": "Continue the conversation",
          "end": "End here"
        }
      }
    ],
    "continue": [
      "alice Let's keep talking!",
      "jump end"
    ],
    "end": [
      "bob Goodbye!",
      "end"
    ]
  }
}
```

### 2. API Methods

```ts
// Control dialogue flow
dialogue.start('Start');           // Start at label
dialogue.jumpTo('continue');       // Jump to label
dialogue.pause();                  // Pause dialogue
dialogue.resume();                 // Resume dialogue
dialogue.nextLine();               // Manual advance
dialogue.skipTypewriter();         // Skip typewriter effect

// Check state
dialogue.isTypewriterActive();     // Is typewriter running?
dialogue.isChoicesActive();        // Are choices showing?

// Show/hide dialogue box
dialogue.show();
dialogue.hide();
```

### 3. Event Hooks

```ts
dialogue.onLineEnd = (line) => {
  console.log('Line finished:', line);
};

dialogue.onChoice = (label, text) => {
  console.log('Choice made:', label, text);
};

dialogue.onShow = (characterId, emotion) => {
  // Show character sprite
  showCharacter(characterId, emotion);
};

dialogue.onHide = (characterId) => {
  // Hide character sprite
  hideCharacter(characterId);
};

dialogue.onEnd = () => {
  // Dialogue sequence finished
  console.log('Dialogue ended!');
};
```

## Configuration Options

```ts
const config = {
  fontFamily: 'Arial',           // Font family
  typeSpeed: 30,                 // Characters per second
  boxStyle: 'default',           // Dialogue box style
  autoForward: false,            // Auto-advance dialogue
  boxAnimationSpeed: 0,          // Box animation speed
  boxPosition: 'bottom',         // 'bottom', 'top', 'center'
  styles: {                      // Custom text styles
    bold: { bold: true },
    red: { color: '#ff0000' }
  },
  audio: {                       // Audio file mapping
    type: 'typewriter.wav',
    choice: 'choice.wav'
  },
  debug: false                   // Enable debug logging
};
```

## Documentation

- **[Overview](.cursor/rules/overview.mdc)** - Plugin architecture and design
- **[Usage Guide](.cursor/rules/usage.mdc)** - Setup, API, and integration examples
- **[JSON Format](.cursor/rules/json-format.mdc)** - Dialogue file structure and commands
- **[Status & Changelog](.cursor/rules/status.mdc)** - Version history and development progress

## License

MIT

---

Built for small teams, hobbyists, and story-heavy games. Perfect for visual novels, RPGs, and narrative-driven experiences. 