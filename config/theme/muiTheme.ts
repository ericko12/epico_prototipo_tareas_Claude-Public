// Copia de config/theme/muiTheme.ts de Épico Móvil.
// Cambios para la versión sintética: fuente local (@fontsource) en lugar de next/font y sin locales de MUI X.
import { createTheme } from '@mui/material';

import { ColorsEpico } from "@/features/common/domain/enums/ColorsEpico";
import { FontWeightEnum } from "@/features/common/domain/enums/FontWeight";
import { esES as esESMui } from '@mui/material/locale'


export const muiTheme = createTheme({
    // Breakpoints explícitos (idénticos a los defaults de MUI) declarados como
    // contrato: `md` = 900px es la frontera de la experiencia móvil, alineada con
    // BreakpointEnum.mobileExperience (features/common/domain/enums/Breakpoint.ts).
    // Debajo de `md` la UI usa el layout adaptativo; en `md`+ se conserva desktop.
    breakpoints: {
        values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    palette: {
        mode: 'light',
        primary: {
            main: ColorsEpico.ColorPrimary,
        },
        secondary: {
            main: ColorsEpico.ColorSecondary,
        },
    },
    typography: {
        fontFamily: ["'Quicksand Variable'", "Quicksand", "sans-serif"].join(','),
        fontWeightRegular: FontWeightEnum.Regular,
        fontWeightLight: FontWeightEnum.Lite,
        fontWeightMedium: FontWeightEnum.Medium,
        fontWeightBold: FontWeightEnum.Bold,
    },
    components: {
        MuiTabs: {
            styleOverrides: {
                root: {
                    "& button": {
                        fontSize: "16px",
                        fontWeight: 700,
                    },
                },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: ColorsEpico.ColorSecondary,
                    },
                },
            },
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: ColorsEpico.ColorSecondary,
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: ColorsEpico.ColorSecondary,
                        },
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: ColorsEpico.ColorSecondary
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: ColorsEpico.ColorSecondary
                        },
                    }
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    '&.Mui-disabled': {
                        '& fieldset': {
                            backgroundColor: 'rgba(0, 0, 0, 0.03)',
                            pointerEvents: 'none'
                        },
                    },
                },
            }
        },
        MuiBreadcrumbs: {
            styleOverrides: {
                separator: {
                    color: ColorsEpico.ColorPrimary,
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    width: '44px',
                    height: '22px',
                    padding: 0,
                },
                switchBase: {
                    padding: 0,
                    margin: 2,
                    transitionDuration: '300ms',
                    '&.Mui-checked': {
                        transform: 'translateX(22px)',
                        color: ColorsEpico.ColorWhite,
                        '& + .MuiSwitch-track': {
                            backgroundColor: 'green',
                            opacity: 1,
                            border: 0,
                        },
                    },
                },
                thumb: {
                    boxSizing: 'border-box',
                    width: 18,
                    height: 18,
                },
                track: {
                    borderRadius: 13,
                    backgroundColor: ColorsEpico.ColorGrayDull,
                    opacity: 1,
                    transition: 'background-color 500ms',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {

                paper: {
                    borderRadius: 8,
                    padding: '.2rem',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: '.8rem 1.2rem 1rem 1.2rem !important',
                    textTransform: 'uppercase',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '.5rem 1rem 1rem 1.3rem !important',
                    color: ColorsEpico.ColorBlack,
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '3px 12px 12px !important',
                }
            },
        },
    },
},
    esESMui
);
