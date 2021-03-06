export class Stroke {

    public cap: CanvasLineCap = 'round';
    public width: number = 1;
    public style: string = 'solid';
    public color: string = '#000000';
    public opacity: number = 100;

    constructor(args?: STROKE) {
        if (typeof (args) != 'undefined' && args != null) {
            if (typeof (args.cap) != 'undefined' && args.cap !== null) {
                this.cap = args.cap;
            };
            if (typeof (args.width) != 'undefined' && args.width !== null) {
                this.width = args.width;
            };
            if (typeof (args.style) != 'undefined' && args.style !== null) {
                this.style = args.style;
            };
            if (typeof (args.color) != 'undefined' && args.color !== null) {
                this.color = args.color;
            };
            if (typeof (args.opacity) != 'undefined' && args.opacity !== null) {
                this.opacity = args.opacity;
            };
        };
    };

}

export interface STROKE {
    cap?: CanvasLineCap;
    width?: number;
    style?: string;
    color?: string;
    opacity?: number;
}