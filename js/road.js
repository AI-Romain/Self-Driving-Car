class Road {
    constructor(x, width, laneCount = 3) {
        this._x = x;
        this._width = width;
        this._laneCount = laneCount;

        this._left = this._x - this._width / 2;
        this._right = this._x + this._width / 2;

        const infinity = 1000000;

        this._top = -infinity;
        this._bottom = infinity;

        const topLeft = {
            x: this._left,
            y: this._top
        };
        const topRight = {
            x: this._right,
            y: this._top
        };
        const bottomLeft = {
            x: this._left,
            y: this._bottom
        };
        const bottomRight = {
            x: this._right,
            y: this._bottom
        };

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight],
        ];

    }

    draw(ctx) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";

        // lanes
        for (let i = 1; i <= this._laneCount - 1; i++) {

            const x = lerp(
                this._left,
                this._right,
                i / this._laneCount
            );

            ctx.setLineDash([20, 20]);
            ctx.beginPath();
            ctx.moveTo(x, this._top);
            ctx.lineTo(x, this._bottom);
            ctx.stroke();

        }

        ctx.setLineDash([]);
        this.borders.forEach(border => {
            ctx.beginPath();
            ctx.moveTo(border[0].x, border[0].y);
            ctx.lineTo(border[1].x, border[1].y);
            ctx.stroke();
        });

    }

    getLaneCenter(laneIndex) {
        const laneWidth = this._width / this._laneCount;
        return this._left + laneWidth / 2 +
            Math.min(laneIndex, this._laneCount - 1) * laneWidth;
    }

}
