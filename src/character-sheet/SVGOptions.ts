// SVG Options stub for core package
export interface ISVGOptions {
    fontSize: number;
    fontFamily: string;
    pageWidth: number;
    pageHeight: number;
    margin: number;
    [key: string]: any;
}

export const defaultSVGOptions: ISVGOptions = {
    fontSize: 12,
    fontFamily: 'Arial',
    pageWidth: 612,
    pageHeight: 792,
    margin: 36,
};

export function normalizeSvgOptions(options?: Partial<ISVGOptions> | null): ISVGOptions {
    return {
        ...defaultSVGOptions,
        ...(options || {}),
    };
}
