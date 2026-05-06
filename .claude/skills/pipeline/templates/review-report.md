# Rapport de review — PR #`<numéro>`

## Verdict
**VALIDÉ** ✅ (aucun 🔴 ni 🟠) — ou — **REJETÉ** ❌

## Scope reviewé
- Fichiers : <git diff --name-only main...HEAD>
- Type check (`npx tsc --noEmit`) : ✅ / ❌
- Lint (`npx eslint src`) : ✅ / ❌
- Parité i18n FR/EN : ✅ / ❌

## 🔴 Critiques
*(rejet immédiat — un seul suffit)*

- aucune

ou :

### `<fichier>:<ligne>` — `<règle violée>`
- **Pattern trouvé** : `<citation ≤ 120 chars>`
- **Correction attendue** : <référence à `.claude/rules/<rule>.md` § ... ou `.claude/skills/<skill>/SKILL.md`>

## 🟠 Majeurs
*(rejet — un seul suffit)*

- aucune

ou : (même format que ci-dessus)

## 🟡 Mineurs
*(non bloquants mais à noter)*

- aucune

## Notes positives
*(optionnel — mentions rapides de ce qui est bien aligné)*

- <ex : navigation localisée respectée (`@/i18n/navigation` utilisé sur toute la nouvelle surface)>
- <ex : 2 fichiers messages cohérents pour les nouvelles clés>
- <ex : IP hashée systématiquement, jamais d'`ipAddress` brute persistée>
- <ex : `setRequestLocale` présent sur la nouvelle page `[locale]`>

---

Rapport produit par l'agent `nextjs-code-reviewer` (`.claude/agents/nextjs-code-reviewer.md`).
