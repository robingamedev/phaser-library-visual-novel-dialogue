# Visual Novel Dialogue Demo

This is a demo project for testing the Visual Novel Dialogue plugin.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the main plugin first:**
   ```bash
   cd ..
   npm run build
   cd demo
   ```

3. **Run the demo:**
   ```bash
   npm run dev
   ```

## Features Tested

- ✅ Dialogue box display
- ✅ Character nameplates
- ✅ Typewriter effect
- ✅ Inline formatting (`{style=value}`)
- ✅ Audio triggers (`{audio=value}`)
- ✅ Choice buttons
- ✅ Character show/hide events
- ✅ Label-based branching

## Controls

- **SPACE** - Skip typewriter effect / advance dialogue
- **ESC** - Skip typewriter effect
- **CLICK** - Select choice buttons

## Demo Flow

1. Welcome message with typewriter effect
2. Character introduction with nameplate
3. Inline styling demonstration
4. Character emotion changes
5. Choice selection
6. Different dialogue branches
7. Character hiding
8. Demo completion

## Troubleshooting

If you see import errors, make sure:
1. The main plugin is built (`npm run build` in the root)
2. Dependencies are installed (`npm install` in demo folder)
3. The local file reference in `package.json` is correct 


## Resources
hello.mp3 by 121053699 - https://freesound.org/people/121053699/sounds/468001/

surprise.wav by juancamiloorjuela
https://freesound.org/people/juancamiloorjuela/sounds/204648/