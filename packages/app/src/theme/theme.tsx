import {
    UnifiedThemeProvider,
    createUnifiedTheme,
    palettes
} from '@backstage/theme';

export const multicolorTheme = createUnifiedTheme({
    palette: {
        ...palettes.light,  // Take everything from the default light theme, then change what you want
        primary: {
            main: '#0c005aff', // Relation
        },
        secondary: {
            main: '#980098ff', // Relation Component  
        },
        background: {
            default: '#dddddd7b', // Light red  
        },
        navigation: {
            background: '#ffffff', // Lighter red background for the left-side panel  
            indicator: '#ffb3ff8f', // Red color for the selected indicator  
            selectedColor: '#2e002eff', // White text color for the selected item  
            color: '#980098ff', // Light gray text color for unselected items  
            navItem: {
                hoverBackground: '#ffc8ff8f', // Darker red for the hover background  
            },
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Remove uppercase text  
                },
                containedPrimary: {
                    backgroundColor: '#980098ff',
                    '&:hover': {
                        backgroundColor: '#ffffff', // Slightly darker red on hover  
                    },
                    color: '#ffffff',
                },
                containedSecondary: {
                    backgroundColor: '#980098ff',
                    '&:hover': {
                        backgroundColor: '#ffffff', // Slightly darker red on hover  
                    },
                    color: '#ffffff',
                },
            },
        },
    },
    fontFamily: 'Noto Sans, sans-serif',
    defaultPageTheme: 'home',
});  