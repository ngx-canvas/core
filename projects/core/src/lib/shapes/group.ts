import { Line } from './line';
import { data } from '../data';
import { Polygon } from './polygon';
import { ObjectId } from '../id';
import { Fill, FILL } from '../utilities/fill';
import { Point, POINT } from '../utilities/point';
import { Stroke, STROKE } from '../utilities/stroke';
import { EVENTS, Events } from '../utilities/events';
import { Position, POSITION } from '../utilities/position';

export class Group extends Events {

    readonly id: string = ObjectId();
    readonly type: string = 'group';

    public data: any = {};
    public name: string = '';
    public fill: FILL = new Fill();
    public stroke: STROKE = new Stroke();
    public hidden: boolean = false;
    public position: POSITION = new Position();
    public selected: boolean = false;
    public dragging: boolean = false;
    public children: any[] = [];

    constructor(group?: GROUP, skip?: boolean) {
        super();

        if (typeof (group) != 'undefined' && group != null) {
            if (typeof (group.name) == 'string') {
                this.name = group.name;
            };
            if (typeof (group.hidden) != "undefined") {
                this.hidden = group.hidden;
            };
            if (Array.isArray(group.children)) {
                this.children = group.children;
            };
            if (typeof (group.data) != "undefined" && group.data != null) {
                this.data = group.data;
            };
            if (typeof (group.fill) != 'undefined' && group.fill != null) {
                this.fill = new Fill(group.fill);
            };
            if (typeof (group.stroke) != 'undefined' && group.stroke != null) {
                this.stroke = new Stroke(group.stroke);
            };
        };

        if (!skip) {
            data.push(this);
        };

        this.bounds();
    };

    public bounds() {
        this.position.top = 100000;
        this.position.left = 100000;
        if (typeof (this.position.right) == 'undefined') {
            this.position.right = 0;
        };
        if (typeof (this.position.bottom) == 'undefined') {
            this.position.bottom = 0;
        };

        this.children.map(child => {
            if (this.position.left > child.position.left) {
                this.position.x = child.position.left;
                this.position.left = this.position.x;
            };
            if (this.position.top > child.position.top) {
                this.position.y = child.position.top;
                this.position.top = this.position.y;
            };
            if (this.position.right < child.position.right) {
                this.position.right = child.position.right;
            };
            if (this.position.bottom < child.position.bottom) {
                this.position.bottom = child.position.bottom;
            };
        });

        this.position.width = this.position.right - this.position.left;
        this.position.height = this.position.bottom - this.position.top;
        this.position.center.x = this.position.x + (this.position.width / 2);
        this.position.center.y = this.position.y + (this.position.height / 2);
    };

    public set(params: any) {
        this.children.map(child => child.set(params));
    };

    public move(point: POINT) {
        let difference = {
            'x': this.position.center.x - point.x,
            'y': this.position.center.y - point.y
        };
        this.position.x = this.position.x - difference.x;
        this.position.y = this.position.y - difference.y;
        this.position.top = this.position.y;
        this.position.left = this.position.x;
        this.position.right = this.position.x + this.position.width;
        this.position.bottom = this.position.y + this.position.height;
        this.position.center.x = this.position.x + (this.position.width / 2);
        this.position.center.y = this.position.y + (this.position.height / 2);

        this.children.map(child => {
            let position = child.position.center;
            position.x = position.x - difference.x;
            position.y = position.y - difference.y;
            if (child instanceof Line || child instanceof Polygon) {
                child.points.map(pt => {
                    pt.x = pt.x - difference.x;
                    pt.y = pt.y - difference.y;
                });
                child.bounds();
            } else if (child instanceof Group) {
                child.moveBy(difference);
            } else {
                child.move(position);
            };
        });

        this.bounds();
    };

    public moveBy(point: POINT) {
        this.position.top -= point.y;
        this.position.left -= point.x;
        this.position.right -= point.x;
        this.position.bottom -= point.y;
        this.position.center.x -= point.x;
        this.position.center.y -= point.y;

        this.children.map(child => {
            let position = child.position.center;
            position.x = position.x - point.x;
            position.y = position.y - point.y;
            if (child instanceof Polygon) {
                child.points.map(pt => {
                    pt.x = pt.x - point.x;
                    pt.y = pt.y - point.y;
                })
            } else if (child instanceof Group) {
                child.moveBy(point);
            } else {
                child.move(position);
            };
        });
    };

    public hit(point: POINT, radius?: number) {
        if (typeof (radius) != "undefined") {
            radius = 0;
        };
        let hit: boolean = true;
        if (point.x < this.position.x - radius) {
            hit = false;
        };
        if (point.x > this.position.x + this.position.width + radius) {
            hit = false;
        };
        if (point.y < this.position.y - radius) {
            hit = false;
        };
        if (point.y > this.position.y + this.position.height + radius) {
            hit = false;
        };
        return hit;
    };

    public near(point: POINT, radius?: number) {
        if (typeof (radius) == "undefined") {
            radius = 0;
        };
        if (this.position.left - radius <= point.x && this.position.left + radius >= point.x && this.position.top - radius <= point.y && this.position.top + radius >= point.y) {
            return new Point({
                'x': this.position.left,
                'y': this.position.top
            });
        };
        if (this.position.right - radius <= point.x && this.position.right + radius >= point.x && this.position.top - radius <= point.y && this.position.top + radius >= point.y) {
            return new Point({
                'x': this.position.right,
                'y': this.position.top
            });
        };
        if (this.position.left - radius <= point.x && this.position.left + radius >= point.x && this.position.bottom - radius <= point.y && this.position.bottom + radius >= point.y) {
            return new Point({
                'x': this.position.left,
                'y': this.position.bottom
            });
        };
        if (this.position.right - radius <= point.x && this.position.right + radius >= point.x && this.position.bottom - radius <= point.y && this.position.bottom + radius >= point.y) {
            return new Point({
                'x': this.position.right,
                'y': this.position.bottom
            });
        };
        return false;
    };

    public resize(point: POINT, current: POINT) {
        let diff = {
            'x': point.x - current.x,
            'y': point.y - current.y
        };
        this.children.map(child => {
            let ratio = {
                'x': Math.abs(child.position.width / this.position.width),
                'y': Math.abs(child.position.height / this.position.height)
            };
            let change = {
                'x': diff.x * ratio.x,
                'y': diff.y * ratio.y
            };
        });
        this.position.width -= diff.x;
        this.position.right -= diff.x;
        this.position.height -= diff.y;
        this.position.bottom -= diff.y;
        this.position.center.x -= (diff.x / 2);
        this.position.center.y -= (diff.y / 2);
    };

}

export interface GROUP extends EVENTS {
    'id'?: string;
    'data'?: any;
    'name'?: string;
    'fill'?: FILL;
    'stroke'?: STROKE;
    'hidden'?: boolean;
    'position'?: POSITION;
    'selected'?: boolean;
    'dragging'?: boolean;
    'children'?: any[];
}