module.exports = {
    extends: ['stylelint-config-standard'],
    ignoreFiles: ['dist/**/*', 'dist-server/**/*', 'node_modules/**/*'],
    rules: {
        // This repo historically uses both snake_case and kebab-case class names.
        'selector-class-pattern': [
            '^[a-z0-9_-]+$',
            { message: 'Use snake_case or kebab-case for class names.' },
        ],
        'no-descending-specificity': null,
        'no-duplicate-selectors': null,
        'color-hex-length': null,
        // Allow modern/experimental properties used by Safari/Chromium (we validate via runtime, not lint).
        'property-no-unknown': [true, { ignoreProperties: ['text-wrap'] }],
    },
}
