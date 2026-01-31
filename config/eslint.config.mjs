// ESLint configuration for the Landing project.
import path from 'node:path'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import unicorn from 'eslint-plugin-unicorn'

const repoRoot = path.resolve(import.meta.dirname, '..')

/**
 * Red Forest — ESLint Flat Config (ESLint v9+)
 * Matches `../forestapp` baseline.
 */
export default tseslint.config(
    // ---------------------------------------------------------------------------
    // Global ignores.
    // ---------------------------------------------------------------------------
    {
        ignores: ['dist', 'node_modules', 'android', 'ios'],
    },

    // ---------------------------------------------------------------------------
    // Base rules for source code.
    // ---------------------------------------------------------------------------
    {
        files: ['**/*.{ts,tsx,js,jsx}'],

        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: path.resolve(repoRoot, 'tsconfig.json'),
                tsconfigRootDir: repoRoot,
                sourceType: 'module',
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
            },
            globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
        },

        plugins: {
            '@typescript-eslint': tseslint.plugin,
            react,
            'react-hooks': reactHooks,
            import: importPlugin,
            unicorn,
        },

        settings: {
            react: { version: 'detect' },
            // Avoid requiring `eslint-import-resolver-typescript` for this repo.
            'import/resolver': { node: true },
        },

        rules: {
            ...tseslint.configs.recommended.rules,
            semi: ['error', 'never'],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {
                    assertionStyle: 'as',
                    objectLiteralTypeAssertions: 'allow-as-parameter',
                },
            ],

            'react/react-in-jsx-scope': 'off',
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'sibling', 'parent', 'index'],
                    pathGroups: [
                        { pattern: 'react', group: 'external', position: 'before' },
                        { pattern: '@/**', group: 'internal', position: 'after' },
                    ],
                    pathGroupsExcludedImportTypes: ['react'],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['../*', '../**'],
                            message:
                                'Use path aliases defined in tsconfig.json instead of relative parent imports.',
                        },
                    ],
                },
            ],

            'id-length': [
                'error',
                {
                    min: 3,
                    properties: 'never',
                    exceptions: [
                        '_',
                        'i',
                        'j',
                        'k',
                        'm',
                        'n',
                        'x',
                        'y',
                        'z',
                        'u',
                        'v',
                        'r',
                        'g',
                        'b',
                        'a',
                        's',
                        't',
                        'q',
                        'p',
                        'dx',
                        'dy',
                        'nx',
                        'ny',
                        'sx',
                        'sy',
                        'id',
                        'op',
                        'ws',
                        'os',
                        'ua',
                        'ts',
                        'ip',
                        'ev',
                        'db',
                        'fs',
                        'ii',
                        'jj',
                        'x0',
                        'y0',
                        'x1',
                        'y1',
                        'x2',
                        'y2',
                        'X0',
                        'Y0',
                        'u0',
                        'v0',
                        'u1',
                        'v1',
                        'aa',
                        'ab',
                        'ba',
                        'bb',
                        't0',
                        't1',
                        't2',
                        'n0',
                        'n1',
                        'n2',
                        'f2',
                        'g2',
                        'xi',
                        'yi',
                        'xf',
                        'yf',
                        'px',
                        'py',
                        'cx',
                        'cy',
                        'ok',
                        'qs',
                        'e',
                        'h',
                        'c',
                        'on',
                        'fn',
                        'd',
                        'd3',
                        'sw',
                    ],
                },
            ],
            'id-denylist': ['error', 'tmp', 'foo', 'bar', 'baz'],

            'spaced-comment': [
                'error',
                'always',
                {
                    block: {
                        markers: ['*'],
                        balanced: true,
                    },
                },
            ],
            'capitalized-comments': [
                'error',
                'always',
                {
                    ignoreInlineComments: false,
                    ignoreConsecutiveComments: true,
                    ignorePattern: '^(?:\\d|[-=]{3,}|eslint|ts-|@ts-|prettier)',
                },
            ],

            '@typescript-eslint/naming-convention': [
                'error',
                // Step 1: Explicitly allow ALL_CAPS constants such as environment or configuration values.
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    filter: { regex: '^[A-Z0-9_]+$', match: true },
                    format: ['UPPER_CASE'],
                },
                // Step 2: Allow React components declared as const in PascalCase while excluding ALL_CAPS via negative lookahead.
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    filter: { regex: '^(?![A-Z0-9_]+$)[A-Z][A-Za-z0-9]*$', match: true },
                    format: ['PascalCase'],
                },
                // Step 3: Require PascalCase for types, classes, interfaces, and enums.
                {
                    selector: ['typeLike', 'class', 'interface', 'enum'],
                    format: ['PascalCase'],
                },
                // Step 4: Allow camelCase and PascalCase for other constants such as factories.
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    format: ['camelCase', 'PascalCase'],
                },
                // Step 5: Use the default for functions, variables, and parameters.
                // Allow PascalCase for destructured property aliases that are component names (e.g., icon: IconComponent).
                {
                    selector: 'parameter',
                    filter: { regex: '^[A-Z][A-Za-z0-9]*$', match: true },
                    format: ['camelCase', 'PascalCase'],
                },
                {
                    selector: ['function', 'variable', 'parameter'],
                    format: ['camelCase'],
                    leadingUnderscore: 'allow',
                },
                // Step 6: Leave properties from external data or APIs unrestricted.
                {
                    selector: 'property',
                    format: null,
                    filter: { regex: '^\\d', match: false },
                },
            ],

            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                    varsIgnorePattern: '^_|^on[A-Z]',
                    argsIgnorePattern: '^_|^on[A-Z]',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            'new-cap': ['error', { newIsCap: true, capIsNew: false }],

            'unicorn/filename-case': [
                'warn',
                {
                    cases: { kebabCase: true, pascalCase: true, camelCase: true },
                    ignore: [/[A-Z]{2,}/],
                },
            ],

            'no-restricted-syntax': [
                'warn',
                {
                    selector: 'JSXAttribute[name.name="className"] Literal[value=/(__|--)/]',
                    message: 'CSS classes must not contain "__" or "--". Use snake_case instead.',
                },
            ],
        },
    },

    // ---------------------------------------------------------------------------
    // TypeScript sources: discourage console.* (warn for now in this repo).
    // ---------------------------------------------------------------------------
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            'no-console': 'error',
        },
    },

    {
        files: ['**/*.d.ts'],
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
                },
            ],
        },
    }
)
