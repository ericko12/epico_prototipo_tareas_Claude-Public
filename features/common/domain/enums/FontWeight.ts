/**
 * Enum that defines various font weights used throughout the application.
 * The values are specified using numeric values that represent the weight of the font.
 * 
 * @enum {number}
 */
export enum FontWeightEnum {
    /**
     * Font weight of 300, used for light text that is less prominent.
     * @type {number}
     */
    Lite = 300,

    /**
     * Font weight of 400, typically used for normal or regular text.
     * @type {number}
     */
    Normal = 400,

    /**
     * Font weight of 500, typically used for slightly bolder than normal text.
     * @type {number}
     */
    Regular = 500,

    /**
     * Font weight of 600, used for medium emphasis or semi-bold text.
     * @type {number}
     */
    Medium = 600,

    /**
     * Font weight of 700, used for bold text or headings that require strong emphasis.
     * @type {number}
     */
    Bold = 700,

    /**
     * Font weight of 900, used for extra bold or black text that requires maximum emphasis.
     * @type {number}
     */
    ExtraBold = 900,
    SemiBold = 800
}