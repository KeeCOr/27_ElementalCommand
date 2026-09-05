# Elemental Command — Steam Achievements

---

## Stats

| API Name | Type | Description |
|----------|------|-------------|
| `STAT_STAGES_CLEARED` | INT | Total stages cleared |
| `STAT_ENEMIES_DEFEATED` | INT | Total enemies defeated |
| `STAT_ELEMENTAL_SYNERGIES` | INT | Total synergy triggers activated |
| `STAT_PERFECT_CLEARS` | INT | Stages cleared with no unit lost |
| `STAT_DISTINCT_UNITS_USED` | INT | Distinct elemental units used in battle |
| `STAT_GEM_ACTIONS` | INT | Total gem-driven actions taken |

---

## Achievements

| API Name | EN Name | KO Name | How to Unlock |
|----------|---------|---------|---------------|
| `ACH_FIRST_BATTLE` | First Command | 첫 번째 명령 | Win your first battle |
| `ACH_STAGE_5` | Elemental Rookie | 원소 신병 | Clear stage 5 |
| `ACH_STAGE_15` | Elemental Tactician | 원소 전술가 | Clear stage 15 |
| `ACH_STAGE_30` | Elemental Commander | 원소 지휘관 | Clear stage 30 |
| `ACH_FIRST_SYNERGY` | Elemental Spark | 원소의 불꽃 | Trigger your first elemental synergy |
| `ACH_SYNERGY_CHAIN` | Resonance Wave | 공명 파동 | Trigger 3 elemental synergies in one battle |
| `ACH_ALL_ELEMENTS` | Five Forces | 다섯 가지 힘 | Win a battle using all five elements |
| `ACH_FIRE_MASTER` | Flame Commander | 화염 지휘관 | Win 10 battles with a Fire-majority party |
| `ACH_WATER_MASTER` | Tide Commander | 파도 지휘관 | Win 10 battles with a Water-majority party |
| `ACH_LIGHT_DARK` | Balance of Elements | 원소의 균형 | Win a battle with both Light and Dark units in your party |
| `ACH_PERFECT_STAGE` | Untouched | 무결 전투 | Clear a stage without losing any unit |
| `ACH_SPEED_CLEAR` | Swift Command | 신속한 명령 | Clear a stage in under 5 minutes |
| `ACH_HUNDRED_ENEMIES` | Mass Deployment | 대량 배치 | Defeat 100 enemies total |
| `ACH_FULL_ROSTER` | Complete Arsenal | 완전한 무기고 | Unlock all elemental unit types |
| `ACH_CAMPAIGN_CLEAR` | Grand Commander | 대원수 | Clear the full campaign |

---

## Implementation Notes

- Steam API: `ISteamUserStats`
- `ACH_ALL_ELEMENTS` requires exactly one of each element type active at battle start
- `ACH_SYNERGY_CHAIN` tracks synergy triggers within a single battle (reset on new battle)
- `ACH_PERFECT_STAGE` checks unit death count at battle end
- All achievements unlockable in offline single-player
- Replace App ID 480 with real Steamworks App ID before submission
