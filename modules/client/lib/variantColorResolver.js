import {
    defaultVariantColorsResolver,
    parseThemeColor,
    rgba,
} from '@mantine/core';

export const variantColorResolver = input => {
    const defaultResolvedColors = defaultVariantColorsResolver(input);
    const parsedColor = parseThemeColor({
        color: input.color || input.theme.primaryColor,
        theme: input.theme,
    });

    if (input.variant === 'light') {
        return {
            background: rgba(parsedColor.value, 0.1),
            hover: rgba(parsedColor.value, 0.15),
            border: `0px solid ${parsedColor.value}`,
            color: 'white',
        };
    }

    if (input.variant === 'light-transparent') {
        return {
            background: 'transparent',
            hover: rgba(parsedColor.value, 0.15),
            border: `0px solid ${parsedColor.value}`,
            color: 'white',
        };
    }

    return defaultResolvedColors;
};
