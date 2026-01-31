export const PARALLAX = {
    layers: [
        {
            selector: '[data-parallax-layer="1"]',
            speed: 0.012,
            scale: 1.02,
            dots: {
                count: 60,
                radius: [0.6, 1.6],
                opacity: [0.15, 0.5],
                colors: ['rgba(0, 220, 255, 0.55)', 'rgba(255, 255, 255, 0.35)'],
                twinkle: [16, 26],
            },
        },
        {
            selector: '[data-parallax-layer="2"]',
            speed: 0.025,
            scale: 1.04,
            dots: {
                count: 90,
                radius: [0.8, 2.0],
                opacity: [0.2, 0.65],
                colors: [
                    'rgba(0, 220, 255, 0.6)',
                    'rgba(157, 16, 40, 0.35)',
                    'rgba(255, 255, 255, 0.4)',
                ],
                twinkle: [12, 22],
            },
        },
        {
            selector: '[data-parallax-layer="3"]',
            speed: 0.04,
            scale: 1.06,
            dots: {
                count: 120,
                radius: [1.0, 2.6],
                opacity: [0.25, 0.75],
                colors: ['rgba(0, 220, 255, 0.75)', 'rgba(255, 255, 255, 0.5)'],
                twinkle: [10, 18],
            },
        },
        {
            selector: '[data-parallax-layer="4"]',
            speed: 0.06,
            scale: 1.08,
            dots: {
                count: 160,
                radius: [1.2, 3.2],
                opacity: [0.3, 0.85],
                colors: [
                    'rgba(157, 16, 40, 0.55)',
                    'rgba(0, 220, 255, 0.8)',
                    'rgba(255, 255, 255, 0.6)',
                ],
                twinkle: [8, 16],
            },
        },
    ],
    maxOffsetPx: 240,
} as const
