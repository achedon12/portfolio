import next from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...next,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "prisma/migrations/**",
      "db/**",
      ".docker/**",
    ],
  },
  {
    rules: {
      // Apostrophes FR partout : on n'échappe pas chaque "l'utilisateur"
      "react/no-unescaped-entities": "off",
      // Math.random dans useMemo avec deps stables = init unique voulue (starfield)
      "react-hooks/purity": "off",
      // Hydratation localStorage dans useEffect = pattern canonique
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
