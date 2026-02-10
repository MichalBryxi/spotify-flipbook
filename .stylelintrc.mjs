export default {
  extends: ['stylelint-config-standard'],
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['plugin', 'source', 'theme', 'utility', 'variant'],
      },
    ],
    'import-notation': 'string',
  },
};
