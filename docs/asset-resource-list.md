# Elemental Command Image Resource List

Date: 2026-05-28

## Generated Image Assets

All images are saved under `public/assets/`.

| File | Purpose | Notes |
| --- | --- | --- |
| `bg-menu.png` | Stage select and party select background | Vertical 480:854 fantasy command room/menu backdrop. |
| `bg-battle.png` | Battle scene background | Vertical 480:854 ruined magical battlefield with readable center play area. |
| `character-portraits-sheet.png` | Playable commander portraits | Five portraits in order: Ember Guard, Tide Arcanist, Wildwood Ranger, Dawn Paladin, Umbral Blade. |
| `enemy-portraits-sheet.png` | Monster portraits | Five portraits in order: Moss Imp, Iron Brute, Grave Warden, Cinder Wisp, Night Maw. |
| `gem-items-sheet.png` | Puzzle gem and board item art | Fire, water, nature, light, dark, bomb, row-clear, obstacle. |
| `deployables-sheet.png` | Building and deployable hero icons | Barracks, Arrow Tower, Mana Well, Field Captain, Crystal Seer, Stone Sentinel. |

## Integration Notes

- Current game code still generates Phaser procedural textures in `src/systems/ArtFactory.js`.
- These generated images are the source art pack for replacing or supplementing those procedural textures.
- Sprite sheets should be cropped into individual runtime textures before wiring them into `BootScene`/`ArtFactory`.
