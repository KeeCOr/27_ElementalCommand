# Elemental Command — IARC Rating Questionnaire Guide

**Game:** Elemental Command (v0.7.0)
**Developer:** Stoicent
**Platform:** Steam (Windows, Singleplayer)
**Date prepared:** 2026-09-05

---

## What is IARC?

The International Age Rating Coalition (IARC) is the rating system used by Steam and most digital storefronts. You complete a questionnaire through the Steam Developer portal, and IARC automatically generates ratings for ESRB (North America), PEGI (Europe), USK (Germany), ClassInd (Brazil), and others simultaneously.

Access the IARC questionnaire at:
`Steamworks > App Admin > [Your App] > Store Presence > Content Survey`

---

## Expected Rating Outcome

| Rating Body | Expected Rating | Descriptor |
|-------------|----------------|------------|
| ESRB | **E (Everyone)** | Mild Fantasy Violence |
| PEGI | **PEGI 3** | No applicable descriptor |
| USK | **USK 0** | |
| ClassInd | **L (Livre / General)** | |
| ACB (Australia) | **G (General)** | |

---

## IARC Questionnaire — Recommended Answers

### Section 1: Violence

**Does the game contain violence?**
- Select: **Yes — Fantasy/Cartoon Violence**

**Describe the nature of violence:**
- Elemental units attack enemy units on a hex grid using elemental abilities (fire bursts, water waves, grass growth, light beams, dark energy).
- Combat results are shown as number reductions (damage numbers) and simple visual effects. There is no blood, gore, dismemberment, or realistic depiction of injury.
- Enemies are fantastical creatures or elemental entities; they disappear or dissolve when defeated.

**Is violence the primary gameplay mechanic?**
- Select: **No** — Combat is a strategic mechanic; the primary focus is elemental positioning and party composition, not violence itself.

**Intensity of violence:**
- Select: **Mild** — Cartoon/fantasy context, no realistic harm depicted.

### Section 2: Sexual Content

**Does the game contain sexual content, nudity, or romantic themes?**
- Select: **No**

### Section 3: Language

**Does the game contain strong language, profanity, or crude humor?**
- Select: **No**

### Section 4: Drug and Alcohol References

**Does the game contain references to or depictions of drugs, alcohol, or tobacco?**
- Select: **No**

### Section 5: Horror / Fear

**Does the game contain horror elements, intense fear, or disturbing imagery?**
- Select: **No**
- Note: The game includes a "Dark" elemental theme (dark energy, shadow units), but this is presented as a standard fantasy gameplay element — not horror imagery, jump scares, or disturbing content.

### Section 6: Gambling

**Does the game contain gambling mechanics, simulated gambling, or random reward mechanics that could be considered gambling?**
- Select: **No**
- Note: There is no loot box system, gacha, or randomized reward purchase mechanism. Stage progression and character unlocks are deterministic.

### Section 7: Online Features

**Does the game support online multiplayer or user-generated content sharing?**
- Select: **No** — Elemental Command is a fully offline, singleplayer game.

**Does the game collect personal data?**
- Select: **No**

### Section 8: In-App Purchases

**Does the game offer in-app purchases?**
- Select: **No**

---

## Content Summary for Rating Justification

Use this text in any freeform justification fields:

> Elemental Command is a singleplayer, offline fantasy strategy game. Players command parties of four elemental units (Fire, Water, Grass, Light, Dark) in hex-grid battles against enemy formations. Combat is turn-based and depicted with stylized, cartoonish visual effects — no blood, gore, or realistic violence. There is no sexual content, profanity, horror imagery, drug references, gambling mechanics, or in-app purchases. The game is entirely offline and collects no user data.

---

## Post-Rating Checklist

- [ ] IARC questionnaire submitted through Steamworks
- [ ] Rating certificate generated and stored (Steamworks saves this automatically)
- [ ] Rating icons displayed correctly on the Steam store page
- [ ] "Content Descriptors" field on store page updated to match IARC output (e.g., "Fantasy Violence")
- [ ] Privacy Policy URL entered in Steamworks App Admin
- [ ] Age-gating settings reviewed (not required for E/PEGI 3 but confirm in Steamworks)

---

## Notes for Future Versions

If any of the following content is added in future updates, re-run the IARC questionnaire:

- Online multiplayer or leaderboards
- In-app purchases or gacha mechanics
- User accounts or data collection
- Content depicting realistic violence, mature themes, or horror elements
