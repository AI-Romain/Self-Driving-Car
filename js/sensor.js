class Sensor {
    constructor(car) {
        this._car = car;
        this._rayCount = 10;
        this._rayLength = 150;
        this._raySpread = Math.PI;

        this._rays = [];

        this._readings = [];

    }

    update(roadBorders, traffic) {
        this.#castRays();
        this._readings = [];
        for (let i = 0; i < this._rays.length; i++) {
            this._readings.push(
                this.#getReading(
                    this._rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    #getReading(ray, roadBorders, traffic) {
        let touches = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }


        }

        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i]._polygon;
            for (let j = 0; j < poly.length; j++) {
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length],
                );
                if (value) {
                    touches.push(value);
                }

            }

        }

        if (touches.length == 0) {
            return null;
        }
        else {
            const offsets = touches.map(touch => touch.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(touch => touch.offset == minOffset);
        }

    }

    #castRays() {
        this._rays = [];
        for (let i = 0; i < this._rayCount; i++) {
            const rayAngle = lerp(
                this._raySpread / 2,
                -this._raySpread / 2,
                this._rayCount == 1 ? 0.5 : i / (this._rayCount - 1)
            ) + this._car.angle;

            const start = { x: this._car.x, y: this._car.y };
            const end = {
                x: this._car.x - Math.sin(rayAngle) * this._rayLength,
                y: this._car.y - Math.cos(rayAngle) * this._rayLength
            };
            this._rays.push([start, end]);

        }
    }

    draw(ctx) {
        for (let i = 0; i < this._rayCount; i++) {
            let end = this._rays[i][1];
            if (this._readings[i]) {
                end = this._readings[i];
            }
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(
                this._rays[i][0].x,
                this._rays[i][0].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'black';
            ctx.moveTo(
                this._rays[i][1].x,
                this._rays[i][1].y,
            );
            ctx.lineTo(
                end.x,
                end.y,
            );
            ctx.stroke();

        }
    }

}