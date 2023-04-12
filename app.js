"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Union {
    constructor(symbol, state) {
        this.symbol = symbol;
        this.state = state;
    }
    getSymbol() {
        return this.symbol;
    }
    getState() {
        return this.state;
    }
}
class State {
    constructor(id) {
        this.unions = new Array;
        this.id = id;
    }
    transition(s) {
        for (let union of this.unions) {
            if (union.getSymbol().toString() == s) {
                return union.getState();
            }
        }
        return undefined;
    }
    join(state, symbol) {
        let union = new Union(symbol, state);
        this.unions.push(union);
        return union;
    }
    // TODO Checkpoint
    disjoin(state, symbol) {
        for (let union of this.unions) {
            if (union.getState() == state && union.getSymbol() == symbol) {
                this.unions.splice(this.unions.indexOf(union), 1);
                return true;
            }
        }
        return false;
    }
    getUnions() {
        return this.unions;
    }
    getId() {
        return this.id;
    }
}
class Circle {
    constructor(ctx) {
        this.x = 0;
        this.y = 0;
        this.radius = 35;
        this.label = '';
        this.font = '25px Times New Roman';
        this.strokeColor = 'black';
        this.labelColor = 'black';
        this.defaultFill = 'white';
        this.highlightFill = 'orange';
        this.hasInnerCircle = false;
        this.isHighlighted = false;
        this.isLabelHidden = false;
        this.ctx = ctx;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getRadius() {
        return this.radius;
    }
    setLabel(label) {
        this.label = label;
    }
    getLabel() {
        return this.label;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
    draw() {
        this.drawCircle();
        if (!this.isLabelHidden)
            this.drawLabel();
        if (this.hasInnerCircle)
            this.drawInnerCircle();
    }
    setInnerCircle(b) {
        this.hasInnerCircle = b;
    }
    drawCircle() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = this.isHighlighted ? this.highlightFill : this.defaultFill;
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.stroke();
    }
    drawInnerCircle() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius * 0.7, 0, 2 * Math.PI, false);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.stroke();
    }
    drawLabel() {
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.labelColor;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.label, this.x, this.y);
    }
    isPointInside(x, y) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy <= this.radius * this.radius;
    }
    generateCirclePoints(numPoints) {
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (2 * Math.PI / numPoints) * i;
            const x = this.radius * Math.cos(angle) + this.x;
            const y = this.radius * Math.sin(angle) + this.y;
            points.push({ x, y });
        }
        return points;
    }
    setHighlight(b) {
        this.isHighlighted = b;
    }
    setHideLabel(b) {
        this.isLabelHidden = b;
    }
    dwarf() {
        this.radius = this.radius * 0.1;
    }
}
class ArrowFactory {
    constructor(ctx, stateFrom, stateTo) {
        this.ctx = ctx;
        this.stateFrom = stateFrom;
        this.stateTo = stateTo;
    }
    createArrow() {
        var _a, _b;
        if (((_a = this.stateFrom) === null || _a === void 0 ? void 0 : _a.getCircle()) == ((_b = this.stateTo) === null || _b === void 0 ? void 0 : _b.getCircle())) {
            return new LoopingArrow(this.ctx);
        }
        else if (this.stateFrom == undefined) {
            return new InitialArrow(this.ctx);
        }
        else {
            return new BezierArrow(this.ctx);
        }
    }
}
class Arrow {
    constructor(ctx) {
        this.controlPointParameter = 1;
        this.defaultColor = 'black';
        this.highlightColor = 'red';
        this.isHighlighted = false;
        this.label = '0';
        this.labelFont = "20px Times New Roman";
        this.isLabelVisible = true;
        this.ctx = ctx;
    }
    drawLabel() {
        this.ctx.font = this.labelFont;
        this.ctx.fillStyle = this.defaultColor;
        this.ctx.fillText(this.label, this.getLabelPosition().x, this.getLabelPosition().y);
    }
    setLabel(label) {
        this.label = label;
    }
    setControlPointParameter(controlPointDistance) {
        if (controlPointDistance == 0)
            return;
        this.controlPointParameter = controlPointDistance;
    }
    setCircleFrom(circleFrom) {
        this.circleFrom = circleFrom;
        this.startX = circleFrom.getX();
        this.startY = circleFrom.getY();
    }
    setCircleTo(circleTo) {
        this.circleTo = circleTo;
        this.endX = circleTo.getX();
        this.endY = circleTo.getY();
    }
    draw() {
        this.updateControlPoint();
        this.drawCurve();
        if (this.isLabelVisible)
            this.drawLabel();
    }
    setHighlight(b) {
        this.isHighlighted = b;
    }
    angleBetweenPoints(x1, y1, x2, y2) {
        // Calculate the difference in x and y coordinates
        const dx = x2 - x1;
        const dy = y2 - y1;
        // Use Math.atan2 to calculate the angle in radians
        let angle = Math.atan2(dy, dx);
        // If the angle is negative, add 2π to bring it to the interval [0, 2π]
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle;
    }
    setLabelVisibility(b) {
        this.isLabelVisible = b;
    }
    getLabelVisibility() {
        return this.isLabelVisible;
    }
}
class BezierArrow extends Arrow {
    constructor(ctx) {
        super(ctx);
        this.t0 = 0;
        this.t1 = 1;
    }
    isLabelClickedAt(x, y) {
        const radius = 15;
        // Check if the clicked position is within a circular boundary 
        // encircling the label and the threshold of the Bezier segment
        const distance = Math.sqrt((x - this.getLabelPosition().x) ** 2 + (y - this.getLabelPosition().y) ** 2);
        return distance <= radius || this.isBezierSegmentTappedAt(x, y) >= 0;
    }
    drawArrowHead() {
        // Draw an arrowhead at the end of the line
        const angle = Math.atan2(this.controlPointY - this.circleTo.getY(), this.controlPointX - this.circleTo.getX());
        let circleToBoundary = this.getCircleBezierIntersection(this.circleTo);
        if (circleToBoundary != undefined) {
            this.ctx.beginPath();
            this.ctx.moveTo(circleToBoundary.x, circleToBoundary.y);
            this.ctx.strokeStyle = this.isHighlighted ? this.highlightColor : this.defaultColor;
            this.ctx.lineTo(circleToBoundary.x + 15 * Math.cos(angle - Math.PI / 6), circleToBoundary.y + 15 * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(circleToBoundary.x + 15 * Math.cos(angle + Math.PI / 6), circleToBoundary.y + 15 * Math.sin(angle + Math.PI / 6));
            this.ctx.closePath();
            this.ctx.fillStyle = this.isHighlighted ? this.highlightColor : this.defaultColor;
            this.ctx.fill();
        }
    }
    updateControlPoint() {
        const point = this.calculateControlPoint();
        this.controlPointX = point.x;
        this.controlPointY = point.y;
    }
    calculateControlPoint(aux = 1) {
        const midX = (this.startX + this.endX) / 2;
        const midY = (this.startY + this.endY) / 2;
        const direction = {
            x: this.endX - this.startX,
            y: this.endY - this.startY
        };
        const directionMagnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2);
        const perpendicular = {
            x: -direction.y / directionMagnitude,
            y: direction.x / directionMagnitude
        };
        const controlPoint = {
            x: midX + perpendicular.x * this.controlPointParameter * aux,
            y: midY + perpendicular.y * this.controlPointParameter * aux
        };
        return controlPoint;
    }
    isCurveClickedAt(x, y) {
        return this.isLabelClickedAt(x, y);
    }
    recalculateCurveViaDraggingPointAt(x, y) {
        const distanceBetweenCircles = Math.sqrt((this.endX - this.startX) ** 2 + (this.endY - this.startY) ** 2);
        const distanceBetweenCircleFromAndMidpoint = this.distanceToProjection({ x, y });
        const t = distanceBetweenCircleFromAndMidpoint / distanceBetweenCircles;
        const calcX = (x - this.startX - (t ** 2) * (this.endX - this.startX)) / (2 * t * (1 - t));
        const calcY = (y - this.startY - (t ** 2) * (this.endY - this.startY)) / (2 * t * (1 - t));
        const alpha = -this.angleBetweenPoints(this.startX, this.startY, this.endX, this.endY);
        const distance = calcY * Math.cos(alpha) + calcX * Math.sin(alpha);
        this.controlPointParameter = distance;
    }
    getCircleBezierIntersection(circle) {
        for (let point of circle.generateCirclePoints(150)) {
            if (this.isBezierCurveTappedAt(point.x, point.y, 0, 1, 1) >= 0) {
                return point;
            }
        }
        return undefined;
    }
    getCircleBezierIntersectionTValue(circle) {
        for (let point of circle.generateCirclePoints(200)) {
            let t = this.isBezierCurveTappedAt(point.x, point.y, 0, 1, 1);
            if (t >= 0) {
                return t;
            }
        }
        return -1;
    }
    isBezierSegmentTappedAt(posX, posY) {
        this.calculateFreeVariableInterval();
        return this.isBezierCurveTappedAt(posX, posY, this.t0, this.t1);
    }
    // The Bezier curve by default compasses the free variable t in the closed interval [0, 1]
    isBezierCurveTappedAt(posX, posY, t0 = 0, t1 = 1, threshold = 12, samples = 1000) {
        for (let t = t0; t <= t1; t += 1 / samples) {
            const x = Math.pow(1 - t, 2) * this.startX + 2 * (1 - t) * t * this.controlPointX + Math.pow(t, 2) * this.endX;
            const y = Math.pow(1 - t, 2) * this.startY + 2 * (1 - t) * t * this.controlPointY + Math.pow(t, 2) * this.endY;
            const distanceToMouse = Math.sqrt(Math.pow(posX - x, 2) + Math.pow(posY - y, 2));
            if (distanceToMouse <= threshold) {
                return t;
            }
        }
        return -1;
    }
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    calculateFreeVariableInterval() {
        this.t0 = this.getCircleBezierIntersectionTValue(this.circleFrom);
        this.t1 = this.getCircleBezierIntersectionTValue(this.circleTo);
    }
    drawCurve(segments = 50) {
        this.calculateFreeVariableInterval();
        if (this.t0 == -1 || this.t1 == -1) {
            console.log("Can't draw curve!");
            return;
        }
        this.ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const t = this.lerp(this.t0, this.t1, i / segments);
            const u = 1 - t;
            const x = u * u * this.startX + 2 * u * t * this.controlPointX + t * t * this.endX;
            const y = u * u * this.startY + 2 * u * t * this.controlPointY + t * t * this.endY;
            if (i === 0) {
                this.ctx.moveTo(x, y);
            }
            else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.strokeStyle = this.isHighlighted ? this.highlightColor : this.defaultColor;
        this.ctx.stroke();
        this.drawArrowHead();
    }
    distanceToProjection(p) {
        // Calculate vectors
        const v = { x: this.endX - this.startX, y: this.endY - this.startY };
        const w = { x: p.x - this.startX, y: p.y - this.startY };
        // Calculate unit vector of v
        const v_length = Math.sqrt(v.x * v.x + v.y * v.y);
        const v_unit = { x: v.x / v_length, y: v.y / v_length };
        // Calculate scalar projection of w onto v
        const scalar_proj = w.x * v_unit.x + w.y * v_unit.y;
        // Calculate projection of p1 onto the line between p0 and p2
        const proj_p1 = {
            x: this.startX + scalar_proj * v_unit.x,
            y: this.startY + scalar_proj * v_unit.y
        };
        // Calculate distance between p0 and proj_p1
        const dist_x = this.startX - proj_p1.x;
        const dist_y = this.startY - proj_p1.y;
        const distance = Math.sqrt(dist_x * dist_x + dist_y * dist_y);
        return distance;
    }
    getLabelPosition() {
        const controlPoint = this.calculateControlPoint(0.5);
        const angle = this.angleBetweenPoints(this.startX, this.startY, this.endX, this.endY);
        let x = controlPoint.x + 20 * Math.sin(angle);
        let y = controlPoint.y + 20 * Math.cos(angle);
        return { x, y };
    }
}
class LoopingArrow extends Arrow {
    constructor(ctx) {
        super(ctx);
        this.startAngle = (2 * Math.PI) / 3;
        this.endAngle = -(2 * Math.PI) / 3;
        this.arrowRadius = 35;
    }
    isLabelClickedAt(x, y) {
        const limit = 15;
        // Checks if the clicked position is within the boundaries of the circle
        const distance = Math.sqrt((x - this.getLabelPosition().x) ** 2 + (y - this.getLabelPosition().y) ** 2);
        return distance <= limit;
    }
    getLabelPosition() {
        let x = this.controlPointX + 1.5 * this.arrowRadius * Math.cos(this.controlPointParameter);
        let y = this.controlPointY + 1.5 * this.arrowRadius * Math.sin(this.controlPointParameter);
        return { x, y };
    }
    drawCurve() {
        this.ctx.beginPath();
        this.ctx.arc(this.controlPointX, this.controlPointY, this.arrowRadius, this.startAngle, this.endAngle, true);
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.isHighlighted ? this.highlightColor : this.defaultColor;
        this.ctx.stroke();
        this.drawArrowHead();
    }
    drawArrowHead() {
        const endPoint = {
            x: this.controlPointX + this.arrowRadius * Math.cos(this.endAngle),
            y: this.controlPointY + this.arrowRadius * Math.sin(this.endAngle),
        };
        // Draw an arrowhead at the end of the line
        const angle = Math.atan2(endPoint.y - this.circleFrom.getY(), endPoint.x - this.circleFrom.getX());
        this.ctx.beginPath();
        this.ctx.moveTo(endPoint.x, endPoint.y);
        this.ctx.lineTo(endPoint.x + 15 * Math.cos(angle - Math.PI / 6), endPoint.y + 15 * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(endPoint.x + 15 * Math.cos(angle + Math.PI / 6), endPoint.y + 15 * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fillStyle = this.isHighlighted ? this.highlightColor : this.defaultColor;
        this.ctx.fill();
    }
    updateControlPoint() {
        this.controlPointX = this.circleFrom.getX() + this.arrowRadius * Math.cos(this.controlPointParameter);
        this.controlPointY = this.circleFrom.getY() + this.arrowRadius * Math.sin(this.controlPointParameter);
        this.startAngle = (2 * Math.PI) / 3 + this.controlPointParameter;
        this.endAngle = -(2 * Math.PI) / 3 + this.controlPointParameter;
    }
    isCurveClickedAt(x, y) {
        const dx = this.controlPointX - x;
        const dy = this.controlPointY - y;
        return dx * dx + dy * dy <= this.arrowRadius ** 2 || this.isLabelClickedAt(x, y);
    }
    recalculateCurveViaDraggingPointAt(x, y) {
        this.controlPointParameter = this.angleBetweenPoints(this.circleFrom.getX(), this.circleFrom.getY(), x, y);
    }
}
class InitialArrow extends Arrow {
    constructor(ctx) {
        super(ctx);
        this.length = 70;
        this.controlPointParameter = 0;
        this.isLabelVisible = false;
    }
    drawCurve() {
        this.endX = this.startX + this.length * Math.cos(this.controlPointParameter);
        this.endY = this.startY + this.length * Math.sin(this.controlPointParameter);
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(this.endX, this.endY);
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.drawArrowHead();
    }
    drawArrowHead() {
        // TODO FIX THIS ******
        const headLength = 60;
        const headAngle = Math.PI / 20;
        const headPoint1X = this.endX - headLength * Math.cos(this.controlPointParameter - headAngle);
        const headPoint1Y = this.endY - headLength * Math.sin(this.controlPointParameter - headAngle);
        const headPoint2X = this.endX - headLength * Math.cos(this.controlPointParameter + headAngle);
        const headPoint2Y = this.endY - headLength * Math.sin(this.controlPointParameter + headAngle);
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(headPoint1X, headPoint1Y);
        this.ctx.lineTo(headPoint2X, headPoint2Y);
        this.ctx.closePath();
        this.ctx.fillStyle = this.defaultColor;
        this.ctx.fill();
    }
    updateControlPoint() {
        // this.controlPointParameter is the angle
        this.startX = this.circleTo.getX() +
            this.circleTo.getRadius() * Math.cos(this.controlPointParameter);
        this.startY = this.circleTo.getY() +
            this.circleTo.getRadius() * Math.sin(this.controlPointParameter);
    }
    isCurveClickedAt(x, y) {
        const distance = Math.sqrt(Math.pow(x - this.endX, 2) + Math.pow(y - this.endY, 2));
        return distance <= this.length;
    }
    recalculateCurveViaDraggingPointAt(x, y) {
        this.controlPointParameter =
            this.angleBetweenPoints(this.circleTo.getX(), this.circleTo.getY(), x, y);
    }
    drawLabel() {
        return;
    }
    isLabelClickedAt(x, y) {
        return false;
    }
    getLabelPosition() {
        return { x: this.endX, y: this.endY };
    }
    setLabelVisibility(b) {
        this.isLabelVisible = false;
    }
}
class StateController {
    constructor(ctx, id, label, x = 0, y = 0) {
        this.isFinal = false;
        this.id = id;
        this.circle = new Circle(ctx);
        this.state = new State(id);
        this.circle.setPosition(x, y);
        this.circle.setLabel(label);
    }
    draw() {
        this.circle.draw();
    }
    getCircle() {
        return this.circle;
    }
    getUnions() {
        return this.state.getUnions();
    }
    getState() {
        return this.state;
    }
    getId() {
        return this.id;
    }
    getName() {
        return this.circle.getLabel();
    }
    setName(label) {
        this.circle.setLabel(label);
    }
    setFinal(b) {
        this.isFinal = b;
        this.circle.setInnerCircle(b);
    }
    setHideLabel(b) {
        this.circle.setHideLabel(b);
    }
    isFinalState() {
        return this.isFinal;
    }
    setHighlight(b) {
        this.circle.setHighlight(b);
    }
    joinWasPerformed(toState, symbol) {
        this.state.join(toState.getState(), symbol);
    }
    disjoinWasPerformed(toState, symbol) {
        this.state.disjoin(toState.getState(), symbol);
    }
    setPosition(x, y) {
        this.circle.setPosition(x, y);
    }
    getPosition() {
        return this.circle.getPosition();
    }
    transition(symbol) {
        return this.state.transition(symbol);
    }
    isClickedAt(x, y) {
        return this.circle.isPointInside(x, y);
    }
    dwarf() {
        this.setHideLabel(true);
        this.circle.dwarf();
    }
}
class UnionComposite {
    constructor(ctx, id, fromState, toState) {
        this.ctx = ctx;
        this.id = id;
        this.fromState = fromState;
        this.toState = toState;
        let arrowFactory = new ArrowFactory(this.ctx, fromState, toState);
        this.arrow = arrowFactory.createArrow();
        // This parameter or 'bias' makes every union arrow between states be randomly skewed
        this.arrow.setControlPointParameter((Math.random() * 80) * (-1) ** Math.floor(Math.random() * 2));
        this.updateArrow();
    }
    drawUnion() {
        let unionsToState = this.getUnionsToState();
        this.updateArrow();
        this.arrow.setLabel(this.getLabelsOf(unionsToState).join(', '));
        this.arrow.draw();
    }
    // TODO updateArrow() should only be called once
    updateArrow() {
        if (this.fromState != undefined)
            this.arrow.setCircleFrom(this.fromState.getCircle());
        this.arrow.setCircleTo(this.toState.getCircle());
    }
    getStateFrom() {
        return this.fromState;
    }
    getStateTo() {
        return this.toState;
    }
    getUnions() {
        return this.getUnionsToState();
    }
    getUnionsToState() {
        if (this.fromState == undefined)
            return [];
        let unions = this.fromState.getUnions();
        let unionsToState = new Array;
        for (let union of unions) {
            if (union.getState() == this.toState.getState()) {
                unionsToState.push(union);
            }
        }
        return unionsToState;
    }
    getArrow() {
        return this.arrow;
    }
    getId() {
        return this.id;
    }
    setLabelVisible(b) {
        this.arrow.setLabelVisibility(b);
    }
    getLabelsOf(unions) {
        let symbols = [];
        for (let union of unions) {
            symbols.push(union.getSymbol().toString());
        }
        return symbols;
    }
    setHighlight(b) {
        this.arrow.setHighlight(b);
    }
    isClickedAt(x, y) {
        return this.arrow.isCurveClickedAt(x, y);
    }
    isLabelClickedAt(x, y) {
        return this.arrow.isLabelClickedAt(x, y);
    }
    recalculateCurveViaDraggingPointAt(x, y) {
        this.arrow.recalculateCurveViaDraggingPointAt(x, y);
    }
    isLabelVisible() {
        return this.arrow.getLabelVisibility();
    }
}
const run_animation_btn = document.querySelector('.run_animation_btn');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let mousePos;
// Function to get the mouse position relative to the canvas
function getMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
    };
}
class AutomataController {
    constructor(ctx) {
        this.states = new Array;
        this.unions = new Array;
        this.finalStates = new Array;
        this.ctx = ctx;
    }
    createState(name, x = 0, y = 0) {
        let state = new StateController(this.ctx, this.states.length, name, x, y);
        this.states.push(state);
        return state;
    }
    // The dwarf state is an auxiliary state whose purpose is to be 
    // the guide of a new union being created between two existing states
    // It's called 'dwarf' because on canvas it is a really tiny circle 
    createDwarfState(x, y) {
        let dwarfState = new StateController(this.ctx, this.states.length, 'dwarf', x, y);
        this.states.push(dwarfState);
        this.dwarfState = dwarfState;
        this.dwarfState.dwarf();
        return dwarfState;
    }
    findState(state) {
        if (typeof state === "string") {
            return this.findStateByName(state);
        }
        else {
            return state;
        }
    }
    join(fromState, toState, symbol) {
        let foundState;
        foundState = this.findState(fromState);
        if (foundState == undefined)
            return false;
        fromState = foundState;
        foundState = this.findState(toState);
        if (foundState == undefined)
            return false;
        toState = foundState;
        // TODO Fix in case a fromState AND toState AND symbol is duplicate
        // The automata notifies each state everytime a join is made
        fromState.joinWasPerformed(toState, symbol);
        // At the same time it is ensured that there are no union duplicates  
        for (let union of this.unions) {
            if (union.getStateFrom() == fromState && union.getStateTo() == toState) {
                return true;
            }
        }
        this.unions.push(new UnionComposite(ctx, this.unions.length, fromState, toState));
        return true;
    }
    // Disjoin will not perform the removal of the union composite, it should not be its duty
    disjoin(fromState, toState, symbol) {
        let foundState;
        foundState = this.findState(fromState);
        if (foundState == undefined)
            return false;
        fromState = foundState;
        foundState = this.findState(toState);
        if (foundState == undefined)
            return false;
        toState = foundState;
        fromState.disjoinWasPerformed(toState, symbol);
        return true;
    }
    removeUnionComposite(unionComposite) {
        let stateFrom = unionComposite.getStateFrom();
        if (stateFrom == undefined)
            return this.removeInitialState();
        for (let union of unionComposite.getUnions()) {
            this.disjoin(stateFrom.getName(), unionComposite.getStateTo().getName(), union.getSymbol());
        }
        return this.unions.splice(this.unions.indexOf(unionComposite), 1).length > 0;
    }
    removeState(state) {
        let foundState = this.findState(state);
        if (foundState == undefined)
            return false;
        state = foundState;
        let unionsToRemove = [];
        for (let unionComposite of this.getUnionComposites()) {
            if (unionComposite.getStateFrom() == state || unionComposite.getStateTo() == state) {
                unionsToRemove.push(unionComposite);
            }
        }
        for (let unionComposite of unionsToRemove) {
            this.removeUnionComposite(unionComposite);
        }
        return this.states.splice(this.states.indexOf(state), 1).length > 0;
    }
    removeDwarfState() {
        if (this.dwarfState == undefined)
            return false;
        return this.removeState(this.dwarfState);
    }
    getDwarfState() {
        return this.dwarfState;
    }
    findStateByName(name) {
        for (let state of this.states) {
            if (state.getName() == name) {
                return state;
            }
        }
        return undefined;
    }
    setInitialState(state) {
        let foundState = this.findState(state);
        if (foundState == undefined)
            return false;
        state = foundState;
        this.initialState = state;
        this.removeInitialState();
        this.unions.push(new UnionComposite(ctx, this.unions.length, undefined, state));
        this.currentState = state;
        return true;
    }
    removeInitialState() {
        for (let union of this.unions) {
            if (union.getStateFrom() == undefined) {
                return this.unions.splice(this.unions.indexOf(union), 1).length > 0;
            }
        }
        return false;
    }
    addFinalState(state) {
        this.finalStates.push(state);
        state.setFinal(true);
        return true;
    }
    removeFinalState(state) {
        state.setFinal(false);
        this.finalStates.splice(this.finalStates.indexOf(state), 1);
        return true;
    }
    setFinalState(state) {
        let foundState = this.findState(state);
        if (foundState == undefined)
            return false;
        state = foundState;
        if (state.isFinalState()) {
            return this.removeFinalState(state);
        }
        else {
            return this.addFinalState(state);
        }
    }
    getControllerFromState(state) {
        for (let controller of this.states) {
            if (controller.getState().getId() == state.getId()) {
                return controller;
            }
        }
        return undefined;
    }
    getUnionComposites() {
        return this.unions;
    }
    getStates() {
        return this.states;
    }
    drawElements() {
        this.drawUnions();
        this.drawStates();
    }
    drawUnions() {
        for (let union of this.unions) {
            union.drawUnion();
        }
    }
    drawStates() {
        for (let state of this.states) {
            state.draw();
        }
    }
    clear() {
        this.states = new Array;
        this.unions = new Array;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    getCurrentState() {
        return this.currentState;
    }
    getInitialState() {
        return this.initialState;
    }
    setCurrentState(state) {
        this.currentState = state;
    }
    findUnionComposite(fromState, toState) {
        for (let unionComposite of this.unions) {
            if (unionComposite.getStateFrom() == fromState && unionComposite.getStateTo() == toState) {
                return unionComposite;
            }
        }
        return null;
    }
}
class AutomataAnimator {
    constructor(automata) {
        this.transitionSpeed = 100;
        this.flickerSpeed = 125;
        this.automata = automata;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    highlightState(b, ms) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            (_a = this.automata.getCurrentState()) === null || _a === void 0 ? void 0 : _a.setHighlight(b);
            reloadCanvas();
            yield this.sleep(ms);
        });
    }
    highlightUnion(b, ms) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentUnion.setHighlight(b);
            reloadCanvas();
            yield this.sleep(ms);
        });
    }
    performStateFlickering() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let step of [0, 1, 2]) {
                yield this.highlightState(true, this.flickerSpeed);
                yield this.highlightState(false, this.flickerSpeed);
            }
        });
    }
    performStateTransition() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.highlightState(true, this.transitionSpeed);
            yield this.highlightState(false, 50);
        });
    }
    // Just a shortener function
    getCurrentState() {
        return this.automata.getCurrentState();
    }
    startAnimation(word) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            this.automata.setCurrentState(this.automata.getInitialState());
            if (this.getCurrentState() == undefined) {
                console.log("No initial state set!");
                return;
            }
            console.log(`Processing word: "${word}"`);
            console.log("Initial state: " + ((_a = this.getCurrentState()) === null || _a === void 0 ? void 0 : _a.getName()));
            yield this.performStateFlickering();
            yield this.performStateTransition();
            for (let symbol of word) {
                let oldState = this.getCurrentState();
                let capturedState = (_b = this.getCurrentState()) === null || _b === void 0 ? void 0 : _b.transition(symbol);
                if (capturedState == undefined) {
                    console.log("An invalid state was processed. Stopping animation");
                    return;
                }
                this.automata.setCurrentState(this.automata.getControllerFromState(capturedState));
                console.log(`"${symbol}" -> ${(_c = this.automata.getCurrentState()) === null || _c === void 0 ? void 0 : _c.getName()}`);
                for (let union of this.automata.getUnionComposites()) {
                    this.currentUnion = union;
                    if (this.currentUnion.getStateFrom() == oldState &&
                        this.currentUnion.getStateTo() == this.getCurrentState()) {
                        yield this.highlightUnion(true, this.transitionSpeed);
                        yield this.highlightUnion(false, this.transitionSpeed);
                    }
                }
                yield this.performStateTransition();
            }
            yield this.performStateFlickering();
        });
    }
}
let automata = new AutomataController(ctx);
const sample1_btn = document.querySelector('.sample1_btn');
sample1_btn.addEventListener('click', () => {
    console.log("Sample 1 button pressed!");
    automata.clear();
    let a = automata.createState('a');
    let b = automata.createState('b');
    a.setPosition(200, 300);
    b.setPosition(500, 300);
    automata.setInitialState('a');
    automata.setFinalState('b');
    automata.join('a', 'a', '0');
    automata.join('a', 'b', '1');
    automata.join('b', 'a', '1');
    automata.join('b', 'b', '0');
    automata.drawElements();
    reloadCanvas();
});
const sample2_btn = document.querySelector('.sample2_btn');
sample2_btn.addEventListener('click', () => {
    console.log("Sample 2 button pressed!");
    automata.clear();
    let q = automata.createState('q');
    let r = automata.createState('r');
    let s = automata.createState('s');
    let t = automata.createState('t');
    let u = automata.createState('u');
    automata.setInitialState('q');
    automata.setFinalState('t');
    automata.setFinalState('u');
    q.setPosition(100, 300);
    r.setPosition(100, 500);
    s.setPosition(300, 300);
    t.setPosition(500, 300);
    u.setPosition(700, 300);
    automata.join('q', 'r', 'a');
    automata.join('q', 's', 'b');
    automata.join('r', 'r', 'a');
    automata.join('r', 'r', 'b');
    automata.join('s', 'r', 'a');
    automata.join('s', 't', 'b');
    automata.join('t', 'u', 'a');
    automata.join('t', 's', 'b');
    automata.join('u', 'u', 'a');
    automata.join('u', 'u', 'b');
    automata.drawElements();
    reloadCanvas();
});
const sample3_btn = document.querySelector('.sample3_btn');
sample3_btn.addEventListener('click', () => {
    console.log("Sample 3 button pressed!");
    automata.clear();
    automata.createState('0', 100, 200);
    automata.createState('1', 250, 200);
    automata.createState('2', 400, 200);
    automata.createState('3', 550, 200);
    automata.createState('4', 700, 200);
    automata.createState('5', 100, 500);
    automata.createState('6', 250, 500);
    automata.createState('7', 400, 450);
    automata.createState('8', 550, 500);
    automata.createState('9', 700, 500);
    automata.setInitialState('0');
    automata.setFinalState('4');
    automata.setFinalState('8');
    automata.join('0', '1', 'a');
    automata.join('0', '0', 'b');
    automata.join('0', '5', 'c');
    automata.join('1', '0', 'a');
    automata.join('1', '0', 'b');
    automata.join('1', '2', 'c');
    automata.join('2', '3', 'a');
    automata.join('2', '5', 'b');
    automata.join('2', '5', 'c');
    automata.join('3', '3', 'a');
    automata.join('3', '3', 'b');
    automata.join('3', '4', 'c');
    automata.join('4', '4', 'a');
    automata.join('4', '4', 'b');
    automata.join('4', '3', 'c');
    automata.join('5', '6', 'a');
    automata.join('5', '5', 'b');
    automata.join('5', '0', 'c');
    automata.join('6', '5', 'a');
    automata.join('6', '5', 'b');
    automata.join('6', '7', 'c');
    automata.join('7', '8', 'a');
    automata.join('7', '0', 'b');
    automata.join('7', '0', 'c');
    automata.join('8', '8', 'a');
    automata.join('8', '8', 'b');
    automata.join('8', '9', 'c');
    automata.join('9', '9', 'a');
    automata.join('9', '9', 'b');
    automata.join('9', '8', 'c');
    automata.drawElements();
    reloadCanvas();
});
const sample4_btn = document.querySelector('.sample4_btn');
sample4_btn.addEventListener('click', () => {
    console.log("Sample 4 button pressed!");
    automata.clear();
    automata.createState('0', 200, 200);
    automata.createState('1', 500, 500);
    automata.setInitialState('0');
    automata.setFinalState('1');
    automata.join('0', '1', 'a');
    automata.drawElements();
    reloadCanvas();
});
sample4_btn.click();
const test_btn = document.querySelector('.test_btn');
test_btn.addEventListener('click', () => {
    console.log("Test button pressed!");
    automata.clear();
    reloadCanvas();
});
let wordInputBox = document.getElementById('wordInputBox');
run_animation_btn.addEventListener('click', () => {
    let word = wordInputBox ? wordInputBox === null || wordInputBox === void 0 ? void 0 : wordInputBox.value : '';
    let automataAnimator = new AutomataAnimator(automata);
    automataAnimator.startAnimation(word);
});
canvas.addEventListener("click", (event) => {
    mousePos = getMousePos(event);
    console.log("Clicked at x: " + mousePos.x + " y: " + mousePos.y);
});
function reloadCanvas() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    automata.drawElements();
}
let selectedFromState = null;
let selectedState = null;
let stateHasBeenSelected = false;
let stateHasBeenDragged = false;
let selectedUnionComposite = null;
let unionHasBeenSelected = false;
let unionHasBeenDragged = false;
let unionIsBeingCreated = false;
let stateLabelIsBeingEdited = false;
let stateLabelCurrentPosition = null;
let unionLabelIsBeingEdited = false;
let unionLabelCurrentPosition = null;
// Moving a state event
canvas.addEventListener('mousedown', (event) => {
    if (!stateHasBeenSelected && !stateLabelIsBeingEdited) {
        mousePos = getMousePos(event);
        for (let state of automata.getStates()) {
            if (state.isClickedAt(mousePos.x, mousePos.y)) {
                selectedState = state;
                stateHasBeenSelected = true;
                break;
            }
        }
    }
});
// Moving an arrow event
canvas.addEventListener('mousedown', (event) => {
    if (!unionHasBeenSelected && !stateHasBeenSelected && !unionLabelIsBeingEdited) {
        mousePos = getMousePos(event);
        for (let unionComposite of automata.getUnionComposites()) {
            if (unionComposite.isClickedAt(mousePos.x, mousePos.y)) {
                selectedUnionComposite = unionComposite;
                unionHasBeenSelected = true;
                break;
            }
        }
    }
});
canvas.addEventListener('mousedown', (event) => {
    if (!unionIsBeingCreated) {
        mousePos = getMousePos(event);
        for (let state of automata.getStates()) {
            if (event.shiftKey && state.isClickedAt(mousePos.x, mousePos.y)) {
                unionIsBeingCreated = true;
                selectedState = automata.createDwarfState(mousePos.x, mousePos.y);
                selectedFromState = state;
                automata.join(state, selectedState, '');
                break;
            }
        }
    }
});
canvas.addEventListener('mousemove', (event) => {
    if (stateHasBeenSelected) {
        if (selectedState == null)
            return;
        stateHasBeenDragged = true;
        const previusMousePos = mousePos;
        mousePos = getMousePos(event);
        const dx = mousePos.x - previusMousePos.x;
        const dy = mousePos.y - previusMousePos.y;
        const currentStatePosition = selectedState.getPosition();
        selectedState.setPosition(currentStatePosition.x + dx, currentStatePosition.y + dy);
        reloadCanvas();
    }
});
canvas.addEventListener('mousemove', (event) => {
    if (unionHasBeenSelected && !stateHasBeenSelected) {
        if (selectedUnionComposite == null)
            return;
        unionHasBeenDragged = true;
        mousePos = getMousePos(event);
        selectedUnionComposite.recalculateCurveViaDraggingPointAt(mousePos.x, mousePos.y);
        reloadCanvas();
    }
});
canvas.addEventListener('mouseup', (event) => {
    stateLabelCurrentPosition = null;
    unionLabelCurrentPosition = null;
    unionHasBeenSelected = false;
    stateHasBeenSelected = false;
    if (unionIsBeingCreated) {
        mousePos = getMousePos(event);
        for (let state of automata.getStates()) {
            if (state.isClickedAt(mousePos.x, mousePos.y) && state != automata.getDwarfState()) {
                if (selectedState != null && selectedFromState != null) {
                    automata.join(selectedFromState, state, '');
                    selectedUnionComposite = automata.findUnionComposite(selectedFromState, state);
                    displayUnionLabelInputBox(selectedUnionComposite);
                }
            }
        }
        automata.removeDwarfState();
        reloadCanvas();
    }
    // If a union has not been dragged then only has been tapped on
    if (!unionHasBeenDragged) {
        selectedUnionComposite === null || selectedUnionComposite === void 0 ? void 0 : selectedUnionComposite.setLabelVisible(false);
        reloadCanvas();
        selectedUnionComposite === null || selectedUnionComposite === void 0 ? void 0 : selectedUnionComposite.setLabelVisible(true);
        displayUnionLabelInputBox(selectedUnionComposite);
    }
    else {
        selectedUnionComposite = null;
    }
    unionHasBeenDragged = false;
    // If a state has not been dragged then only has been tapped on
    if (!stateHasBeenDragged) {
        selectedState === null || selectedState === void 0 ? void 0 : selectedState.setHideLabel(true);
        reloadCanvas();
        selectedState === null || selectedState === void 0 ? void 0 : selectedState.setHideLabel(false);
        displayStateLabelInputBox(selectedState);
    }
    else {
        selectedState = null;
    }
    stateHasBeenDragged = false;
    unionIsBeingCreated = false;
    selectedFromState = null;
});
canvas.addEventListener('dblclick', (event) => {
    mousePos = getMousePos(event);
    for (let state of automata.getStates()) {
        if (state.isClickedAt(mousePos.x, mousePos.y)) {
            automata.setInitialState(state);
            return;
        }
    }
    selectedState = automata.createState('', mousePos.x, mousePos.y);
    displayStateLabelInputBox(selectedState);
    reloadCanvas();
});
let stateLabelBox = document.getElementById('stateLabelBox');
let unionLabelBox = document.getElementById('unionLabelBox');
function displayUnionLabelInputBox(unionComposite) {
    if (unionComposite == null)
        return;
    unionLabelIsBeingEdited = true;
    let labelPos = unionComposite.getArrow().getLabelPosition();
    unionLabelCurrentPosition = labelPos;
    unionLabelBox.style.left = `${unionLabelCurrentPosition.x + 2}px`;
    unionLabelBox.style.top = `${unionLabelCurrentPosition.y - 4}px`;
    unionLabelBox.style.display = 'block';
    unionLabelBox.focus();
}
function displayStateLabelInputBox(state) {
    if (state == null)
        return;
    stateLabelIsBeingEdited = true;
    let labelPos = state.getPosition();
    stateLabelCurrentPosition = labelPos;
    stateLabelBox.style.left = `${stateLabelCurrentPosition.x + 7}px`;
    stateLabelBox.style.top = `${stateLabelCurrentPosition.y - 7}px`;
    stateLabelBox.style.display = 'block';
    stateLabelBox.focus();
}
stateLabelBox.addEventListener('input', () => {
    if (stateLabelCurrentPosition == null)
        return;
    const inputWidth = stateLabelBox.value.length * 10;
    stateLabelBox.style.left = `${stateLabelCurrentPosition.x - inputWidth / 2 + 5}px`;
});
stateLabelBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        stateLabelBox.blur();
    }
});
stateLabelBox.addEventListener('blur', () => {
    stateLabelBox.value = stateLabelBox.value.trim();
    if (stateLabelBox.value == '') {
        console.log("State label not valid");
        stateLabelBox.style.display = 'none';
        selectedState = null;
        stateLabelIsBeingEdited = false;
        return;
    }
    selectedState === null || selectedState === void 0 ? void 0 : selectedState.setName(stateLabelBox.value);
    stateLabelBox.style.display = 'none';
    stateLabelBox.value = '';
    reloadCanvas();
    selectedState = null;
    stateLabelIsBeingEdited = false;
});
unionLabelBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        unionLabelBox.blur();
    }
});
unionLabelBox.addEventListener('blur', () => {
    unionLabelBox.value = unionLabelBox.value.trim();
    if (unionLabelBox.value == '') {
        console.log("Union label not valid");
        unionLabelBox.style.display = 'none';
        reloadCanvas();
        selectedUnionComposite = null;
        unionLabelIsBeingEdited = false;
        return;
    }
    if (selectedUnionComposite == null) {
        console.log("No union composite is selected");
        return;
    }
    let stateFrom = selectedUnionComposite.getStateFrom();
    if (stateFrom == null) {
        console.log("stateFrom of the union composite is null");
        return;
    }
    // This is how the next section works:
    // 1. Get all unions related to the union composite
    // 2. Disjoin them (exactly the same as deleting them)
    // 3. Add new unions based on the input box value
    for (let union of selectedUnionComposite.getUnions()) {
        automata.disjoin(stateFrom, selectedUnionComposite.getStateTo(), union.getSymbol());
    }
    for (let symbol of unionLabelBox.value.split(',')) {
        automata.join(stateFrom, selectedUnionComposite.getStateTo(), symbol);
    }
    // Reset the input box
    unionLabelBox.value = '';
    unionLabelBox.style.display = 'none';
    reloadCanvas();
    selectedUnionComposite = null;
    unionLabelIsBeingEdited = false;
});
