/** @type {import('lint-staged').Configuration} */
const eslintConfigByPrefix = {
  'apps/web/': 'apps/web/eslint.config.js',
  'apps/api/': 'apps/api/eslint.config.js',
  'packages/config/': 'packages/config/eslint.config.js',
  'packages/contracts/': 'packages/contracts/eslint.config.js',
  'packages/db/': 'packages/db/eslint.config.js',
  'packages/shared/': 'packages/shared/eslint.config.js',
};

/**
 * Route staged TypeScript files to the nearest workspace ESLint flat config.
 */
function eslintFixCommands(filenames) {
  const byConfig = new Map();

  for (const filename of filenames) {
    const prefix = Object.keys(eslintConfigByPrefix).find((entry) => filename.startsWith(entry));
    if (!prefix) {
      continue;
    }

    const configPath = eslintConfigByPrefix[prefix];
    const files = byConfig.get(configPath) ?? [];
    files.push(filename);
    byConfig.set(configPath, files);
  }

  return [...byConfig.entries()].map(
    ([configPath, files]) =>
      `eslint --fix --config ${configPath} ${files.map((file) => `"${file}"`).join(' ')}`,
  );
}

export default {
  '*.{ts,tsx}': eslintFixCommands,
  '*.{ts,tsx,json,md,css}': 'prettier --write',
};
