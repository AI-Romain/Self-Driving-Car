class Car {
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;

        this._useBrain = controlType == "AI";

        if (controlType != "DUMMY") {
            this._sensor = new Sensor(this);
            this._brain = new NeuralNetwork(
                [this._sensor._rayCount, 6, 4]
            );
        }
        this._controls = new Controls(controlType);

        this._speed = 0;
        this._acceleration = 0.2;
        this._maxSpeed = maxSpeed;
        this._friction = 0.05;
        this._angle = 0;
        this._damaged = false;
    }

    update(roadBorders, traffic) {
        if (!this._damaged) {
            this.#move();
            this._polygon = this.#createPolygon();
            this._damaged = this.#assessDamage(roadBorders, traffic);
        }
        if (this._sensor) {
            this._sensor.update(roadBorders, traffic);
            const offsets = this._sensor._readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this._brain);
            if (this._useBrain) {
                this._controls.forward = outputs[0];
                this._controls.left = outputs[1];
                this._controls.right = outputs[2];
                this._controls.backward = outputs[3];
            }
        }
    }

    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersect(this._polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersect(this._polygon, traffic[i]._polygon)) {
                return true;
            }
        }
        return false;
    }

    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this._width, this._height) / 2;
        const alpha = Math.atan2(this._width, this._height);
        points.push({
            x: this._x - Math.sin(this._angle - alpha) * rad,
            y: this._y - Math.cos(this._angle - alpha) * rad
        });
        points.push({
            x: this._x - Math.sin(this._angle + alpha) * rad,
            y: this._y - Math.cos(this._angle + alpha) * rad
        });
        points.push({
            x: this._x - Math.sin(Math.PI + this._angle - alpha) * rad,
            y: this._y - Math.cos(Math.PI + this._angle - alpha) * rad
        });
        points.push({
            x: this._x - Math.sin(Math.PI + this._angle + alpha) * rad,
            y: this._y - Math.cos(Math.PI + this._angle + alpha) * rad
        });
        return points;
    }

    #move() {
        // FORWARD
        if (this._controls.forward) {
            this._speed += this._acceleration;
        }
        // BACKWARD
        if (this._controls.backward) {
            this._speed -= this._acceleration;
        }

        // Speed & Acceleration & Friction
        if (this._speed > this._maxSpeed) {
            this._speed = this._maxSpeed;
        }

        if (this._speed < - this._maxSpeed / 2) {
            this._speed = - this._maxSpeed / 2;
        }

        if (this._speed > 0) {
            this._speed -= this._friction;
        }
        if (this._speed < 0) {
            this._speed += this._friction;
        }

        if (Math.abs(this._speed) < this._friction) {
            this._speed = 0;
        }

        if (this._speed != 0) {
            const flip = this._speed > 0 ? 1 : - 1;
            // LEFT
            if (this._controls.left) {
                this._angle += 0.018 * flip;
            }

            // RIGHT
            if (this._controls.right) {
                this._angle -= 0.018 * flip;
            }
        }

        this._x -= Math.sin(this._angle) * this._speed;
        this._y -= Math.cos(this._angle) * this._speed;
    }

    draw(ctx, color, drawSensors = false) {
        if (this._damaged) {
            ctx.fillStyle = 'gray';
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this._polygon[0].x, this._polygon[0].y);
        for (let i = 1; i < this._polygon.length; i++) {
            ctx.lineTo(this._polygon[i].x, this._polygon[i].y);
        }
        ctx.fill();
        if (this._sensor && drawSensors)
            this._sensor.draw(ctx);
    }

    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get angle() {
        return this._angle;
    }
    set x(value) {
        this._x = value;
    }
    set y(value) {
        this._y = value;
    }
    set angle(value) {
        this._angle = value;
    }
    set brain(value) {
        this._brain = value;
    }
    get brain() {
        return this._brain;
    }
}