
class Union {
    private symbol: string
    private state: State

    constructor(symbol: string, state: State) {
        this.symbol = symbol
        this.state = state
    }

    getSymbol(): string {
        return this.symbol
    }

    getState(): State {
        return this.state
    }
}

class State {
    private unions: Array<Union> = new Array<Union>
    private id: number

    constructor(id: number) {
        this.id = id
    }

    public transition(s: String): State | undefined {
        for (let union of this.unions) {
            if (union.getSymbol().toString() == s) {
                return union.getState()
            }
        }
        return undefined
    }

    public join(state: State, symbol: string): Union {
        let union: Union = new Union(symbol, state)
        this.unions.push(union)
        return union
    }

    // TODO Checkpoint
    public disjoin(state: State, symbol: string): boolean {
        for (let union of this.unions) {
            if (union.getState() == state && union.getSymbol() == symbol) {
                this.unions.splice(this.unions.indexOf(union), 1)
                return true
            }
        }
        return false
    }

    public getUnions(): Array<Union> {
        return this.unions
    }

    public getId(): number {
        return this.id
    }
}

class Circle {
    private x: number = 0
    private y: number = 0
    private radius: number = 35
    private label: string = ''
    private font: string = '25px Times New Roman'
    private strokeColor: string = 'black'
    private labelColor: string = 'black'
    private defaultFill: string = 'white'
    private highlightFill: string = 'orange'
    private ctx: CanvasRenderingContext2D
    private hasInnerCircle: boolean = false
    private isHighlighted: boolean = false
    protected isLabelHidden: boolean = false

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    public getX(): number {
        return this.x
    }

    public getY(): number {
        return this.y
    }

    public getRadius(): number {
        return this.radius
    }

    public setLabel(label: string): void {
        this.label = label
    }

    public getLabel(): string {
        return this.label
    }

    public setPosition(x: number, y: number): void {
        this.x = x
        this.y = y
    }

    public getPosition(): {x: number, y: number} {
        return {x: this.x, y: this.y}
    }

    public draw(): void {
        this.drawCircle()
        if (!this.isLabelHidden) this.drawLabel()
        if (this.hasInnerCircle) this.drawInnerCircle()
    }

    public setInnerCircle(b: boolean): void {
        this.hasInnerCircle = b
    }

    private drawCircle() {
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
        this.ctx.fillStyle = this.isHighlighted ? this.highlightFill : this.defaultFill
        this.ctx.fill()
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = this.strokeColor
        this.ctx.stroke()
    }

    private drawInnerCircle() {
        this.ctx.beginPath()
        this.ctx.arc(this.x, this.y, this.radius * 0.7, 0, 2 * Math.PI, false)
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = this.strokeColor
        this.ctx.stroke()
    }

    private drawLabel() {
        this.ctx.font = this.font
        this.ctx.fillStyle = this.labelColor
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.label, this.x, this.y)
    }

    public isPointInside(x: number, y: number): boolean {
        const dx = this.x - x
        const dy = this.y - y
        return dx * dx + dy * dy <= this.radius * this.radius
    }

    public generateCirclePoints(numPoints: number): {x: number, y: number}[] {
        const points = []
      
        for (let i = 0; i < numPoints; i++) {
          const angle = (2 * Math.PI / numPoints) * i
          const x = this.radius * Math.cos(angle) + this.x
          const y = this.radius * Math.sin(angle) + this.y
      
          points.push({x, y})
        }
      
        return points
    }

    public setHighlight(b: boolean): void {
        this.isHighlighted = b
    }

    public setHideLabel(b: boolean): void {
        this.isLabelHidden = b
    }

    public dwarf(): void {
        this.radius = this.radius * 0.1
    }
}

class ArrowFactory {
    private stateFrom: StateController | undefined
    private stateTo: StateController | undefined
    private ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D, stateFrom?: StateController, stateTo?: StateController) {
        this.ctx = ctx
        this.stateFrom = stateFrom
        this.stateTo = stateTo
    }

    public createArrow(): Arrow {
        if (this.stateFrom?.getCircle() == this.stateTo?.getCircle()) {
            return new LoopingArrow(this.ctx)
        } else if (this.stateFrom == undefined) {
            return new InitialArrow(this.ctx)
        } else {
            return new BezierArrow(this.ctx)
        }
    }
}

abstract class Arrow {
    protected ctx: CanvasRenderingContext2D
    protected isLoopingArc: boolean
    protected circleFrom: Circle
    protected circleTo: Circle
    protected startX: number
    protected startY: number
    protected endX: number
    protected endY: number
    protected controlPointX: number
    protected controlPointY: number
    protected controlPointParameter: number = 1
    protected defaultColor: string = 'black'
    protected highlightColor: string = 'red'
    protected isHighlighted: boolean = false
    protected label: string = '0'
    protected labelFont: string = "20px Times New Roman"
    protected isLabelVisible: boolean = true

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }
    
    protected abstract drawCurve(): void
    protected abstract drawArrowHead(): void
    protected abstract updateControlPoint(): void
    public abstract isLabelClickedAt(x: number, y: number): boolean
    public abstract getLabelPosition(): {x: number, y: number}
    public abstract isCurveClickedAt(x: number, y: number): boolean
    public abstract recalculateCurveViaDraggingPointAt(x: number, y: number): void

    protected drawLabel(): void {
        this.ctx.font = this.labelFont
        this.ctx.fillStyle = this.defaultColor
        this.ctx.fillText(this.label, this.getLabelPosition().x, this.getLabelPosition().y)
    }
    
    public setLabel(label: string): void {
        this.label = label
    }
    
    public setControlPointParameter(controlPointDistance: number): void {
        if (controlPointDistance == 0) return
        this.controlPointParameter = controlPointDistance
    }
    
    public setCircleFrom(circleFrom: Circle): void {
        this.circleFrom = circleFrom
        this.startX = circleFrom.getX()
        this.startY = circleFrom.getY()
    }
    
    public setCircleTo(circleTo: Circle): void {
        this.circleTo = circleTo
        this.endX = circleTo.getX()
        this.endY = circleTo.getY()
    }
    
    public draw(): void {
        this.updateControlPoint()
        this.drawCurve()
        if (this.isLabelVisible) this.drawLabel()
    }
    
    public setHighlight(b: boolean): void {
        this.isHighlighted = b
    }

    protected angleBetweenPoints(x1: number, y1: number, x2: number, y2: number): number {
        // Calculate the difference in x and y coordinates
        const dx = x2 - x1
        const dy = y2 - y1
      
        // Use Math.atan2 to calculate the angle in radians
        let angle = Math.atan2(dy, dx)
      
        // If the angle is negative, add 2π to bring it to the interval [0, 2π]
        if (angle < 0) {
          angle += 2 * Math.PI
        }
      
        return angle
    }

    public setLabelVisibility(b: boolean): void {
        this.isLabelVisible = b
    }

    public getLabelVisibility(): boolean {
        return this.isLabelVisible
    }
}

class BezierArrow extends Arrow {
    private t0: number = 0
    private t1: number = 1

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx)
    }

    public isLabelClickedAt(x: number, y: number): boolean {
        const radius = 15
        // Check if the clicked position is within a circular boundary 
        // encircling the label and the threshold of the Bezier segment
        const distance = Math.sqrt((x - this.getLabelPosition().x) ** 2 + (y - this.getLabelPosition().y) ** 2)
        return distance <= radius || this.isBezierSegmentTappedAt(x, y) >= 0
    }

    protected drawArrowHead(): void {
        // Draw an arrowhead at the end of the line
        const angle = Math.atan2(this.controlPointY - this.circleTo.getY(), this.controlPointX - this.circleTo.getX())
        let circleToBoundary = this.getCircleBezierIntersection(this.circleTo)

        if (circleToBoundary != undefined) {
            this.ctx.beginPath()
            this.ctx.moveTo(circleToBoundary.x, circleToBoundary.y)
            this.ctx.strokeStyle = this.isHighlighted ? this.highlightColor : this.defaultColor
            this.ctx.lineTo(circleToBoundary.x + 15 * Math.cos(angle - Math.PI / 6), circleToBoundary.y + 15 * Math.sin(angle - Math.PI / 6))
            this.ctx.lineTo(circleToBoundary.x + 15 * Math.cos(angle + Math.PI / 6), circleToBoundary.y + 15 * Math.sin(angle + Math.PI / 6))
            this.ctx.closePath()
            this.ctx.fillStyle = this.isHighlighted ? this.highlightColor : this.defaultColor
            this.ctx.fill()
        }
    }

    protected updateControlPoint(): void {
        const point = this.calculateControlPoint()
        this.controlPointX = point.x
        this.controlPointY = point.y
    }

    private calculateControlPoint(aux: number = 1): {x: number, y: number} {
        const midX = (this.startX + this.endX) / 2
        const midY = (this.startY + this.endY) / 2
    
        const direction = {
            x: this.endX - this.startX,
            y: this.endY - this.startY
        }

        const directionMagnitude = Math.sqrt(direction.x ** 2 + direction.y ** 2)

        const perpendicular = {
            x: -direction.y / directionMagnitude,
            y: direction.x / directionMagnitude
        }

        const controlPoint = {
            x: midX + perpendicular.x * this.controlPointParameter * aux,
            y: midY + perpendicular.y * this.controlPointParameter * aux
        }

        return controlPoint
    }

    public isCurveClickedAt(x: number, y: number): boolean {
        return this.isLabelClickedAt(x, y)
    }

    public recalculateCurveViaDraggingPointAt(x: number, y: number): void {
        const distanceBetweenCircles = Math.sqrt((this.endX - this.startX) ** 2 + (this.endY - this.startY) ** 2)
        const distanceBetweenCircleFromAndMidpoint = this.distanceToProjection({x, y})
        const t = distanceBetweenCircleFromAndMidpoint / distanceBetweenCircles

        const calcX = (x - this.startX - (t ** 2)*(this.endX - this.startX)) / (2*t*(1 - t))
        const calcY = (y - this.startY - (t ** 2)*(this.endY - this.startY)) / (2*t*(1 - t))

        const alpha = - this.angleBetweenPoints(this.startX, this.startY, this.endX, this.endY)
        const distance = calcY * Math.cos(alpha) + calcX * Math.sin(alpha)

        this.controlPointParameter = distance
    }

    public getCircleBezierIntersection(circle: Circle): {x: number, y: number} | undefined {
        for (let point of circle.generateCirclePoints(150)) {
            if (this.isBezierCurveTappedAt(point.x, point.y, 0, 1, 1) >= 0) {
                return point
            }
        }
        return undefined
    }

    public getCircleBezierIntersectionTValue(circle: Circle): number {
        for (let point of circle.generateCirclePoints(200)) {
            let t = this.isBezierCurveTappedAt(point.x, point.y, 0, 1, 1)
            if (t >= 0) {
                return t
            }
        }
        return -1
    }

    private isBezierSegmentTappedAt(posX: number, posY: number): number {
        this.calculateFreeVariableInterval()
        return this.isBezierCurveTappedAt(posX, posY , this.t0, this.t1)
    }
    
    // The Bezier curve by default compasses the free variable t in the closed interval [0, 1]
    private isBezierCurveTappedAt(posX: number, posY: number, t0: number = 0, t1: number = 1, threshold = 12, samples = 1000): number {
        for (let t = t0; t <= t1; t += 1 / samples) {
            const x = Math.pow(1 - t, 2) * this.startX + 2 * (1 - t) * t * this.controlPointX + Math.pow(t, 2) * this.endX
            const y = Math.pow(1 - t, 2) * this.startY + 2 * (1 - t) * t * this.controlPointY + Math.pow(t, 2) * this.endY

            const distanceToMouse = Math.sqrt(Math.pow(posX - x, 2) + Math.pow(posY - y, 2));
            if (distanceToMouse <= threshold) {
                return t
            }
        }
        return -1
    }

    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    private calculateFreeVariableInterval(): void {
        this.t0 = this.getCircleBezierIntersectionTValue(this.circleFrom)
        this.t1 = this.getCircleBezierIntersectionTValue(this.circleTo)
    }
    
    protected drawCurve(segments = 50): void {
        this.calculateFreeVariableInterval()

        if (this.t0 == -1 || this.t1 == -1) {
            console.log("Can't draw curve!")
            return
        }

        this.ctx.beginPath()
    
        for (let i = 0; i <= segments; i++) {
            const t = this.lerp(this.t0, this.t1, i / segments)
            const u = 1 - t
    
            const x = u * u * this.startX + 2 * u * t * this.controlPointX + t * t * this.endX
            const y = u * u * this.startY + 2 * u * t * this.controlPointY + t * t * this.endY
    
            if (i === 0) {
                this.ctx.moveTo(x, y)
            } else {
                this.ctx.lineTo(x, y)
            }
        }

        this.ctx.strokeStyle = this.isHighlighted ? this.highlightColor : this.defaultColor
        this.ctx.stroke()
        this.drawArrowHead()
    }

    private distanceToProjection(p: {x: number, y: number}): number {
        // Calculate vectors
        const v = { x: this.endX - this.startX, y: this.endY - this.startY }
        const w = { x: p.x - this.startX, y: p.y - this.startY }
      
        // Calculate unit vector of v
        const v_length = Math.sqrt(v.x * v.x + v.y * v.y)
        const v_unit = { x: v.x / v_length, y: v.y / v_length }
      
        // Calculate scalar projection of w onto v
        const scalar_proj = w.x * v_unit.x + w.y * v_unit.y
      
        // Calculate projection of p1 onto the line between p0 and p2
        const proj_p1 = {
          x: this.startX + scalar_proj * v_unit.x,
          y: this.startY + scalar_proj * v_unit.y
        };
      
        // Calculate distance between p0 and proj_p1
        const dist_x = this.startX - proj_p1.x
        const dist_y = this.startY - proj_p1.y
        const distance = Math.sqrt(dist_x * dist_x + dist_y * dist_y)
      
        return distance
    }

    public getLabelPosition(): {x: number, y: number} {
        const controlPoint = this.calculateControlPoint(0.5)
        const angle = this.angleBetweenPoints(this.startX, this.startY, this.endX, this.endY)

        let x = controlPoint.x + 20 * Math.sin(angle)
        let y = controlPoint.y + 20 * Math.cos(angle)

        return {x, y}
    }
}

class LoopingArrow extends Arrow {
    private startAngle: number = (2 * Math.PI)/3
    private endAngle: number = - (2 * Math.PI)/3
    private arrowRadius: number = 35

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx)
    }

    public isLabelClickedAt(x: number, y: number): boolean {
        const limit = 15
        // Checks if the clicked position is within the boundaries of the circle
        const distance = Math.sqrt((x - this.getLabelPosition().x) ** 2 + (y - this.getLabelPosition().y) ** 2)
        return distance <= limit
    }

    public getLabelPosition(): { x: number; y: number } {
        let x = this.controlPointX + 1.5 * this.arrowRadius * Math.cos(this.controlPointParameter)
        let y = this.controlPointY + 1.5 * this.arrowRadius * Math.sin(this.controlPointParameter)
        return {x, y}
    }

    protected drawCurve() {
        this.ctx.beginPath()
        this.ctx.arc(this.controlPointX, this.controlPointY, this.arrowRadius, this.startAngle, this.endAngle, true)
        this.ctx.lineWidth = 1
        this.ctx.strokeStyle = this.isHighlighted ? this.highlightColor : this.defaultColor
        this.ctx.stroke()

        this.drawArrowHead()
    }

    protected drawArrowHead(): void {
        const endPoint = {
            x: this.controlPointX + this.arrowRadius * Math.cos(this.endAngle),
            y: this.controlPointY + this.arrowRadius * Math.sin(this.endAngle),
        }

        // Draw an arrowhead at the end of the line
        const angle = Math.atan2(endPoint.y - this.circleFrom.getY(), endPoint.x - this.circleFrom.getX())
        this.ctx.beginPath()
        this.ctx.moveTo(endPoint.x, endPoint.y)
        this.ctx.lineTo(endPoint.x + 15 * Math.cos(angle - Math.PI / 6), endPoint.y + 15 * Math.sin(angle - Math.PI / 6))
        this.ctx.lineTo(endPoint.x + 15 * Math.cos(angle + Math.PI / 6), endPoint.y + 15 * Math.sin(angle + Math.PI / 6))
        this.ctx.closePath()
        this.ctx.fillStyle = this.isHighlighted ? this.highlightColor : this.defaultColor
        this.ctx.fill()
    }

    protected updateControlPoint(): void {
        this.controlPointX = this.circleFrom.getX() + this.arrowRadius * Math.cos(this.controlPointParameter)
        this.controlPointY = this.circleFrom.getY() + this.arrowRadius * Math.sin(this.controlPointParameter)
        this.startAngle = (2 * Math.PI)/3 + this.controlPointParameter
        this.endAngle = - (2 * Math.PI)/3 + this.controlPointParameter
    }

    public isCurveClickedAt(x: number, y: number): boolean {
        const dx = this.controlPointX - x
        const dy = this.controlPointY - y
        return dx * dx + dy * dy <= this.arrowRadius ** 2 || this.isLabelClickedAt(x, y)
    }

    public recalculateCurveViaDraggingPointAt(x: number, y: number): void {
        this.controlPointParameter = this.angleBetweenPoints(this.circleFrom.getX(), this.circleFrom.getY(), x, y)
    }
}

class InitialArrow extends Arrow {
    private length: number = 70

    constructor(ctx: CanvasRenderingContext2D) {
        super(ctx)
        this.controlPointParameter = 0
        this.isLabelVisible = false
    }

    protected drawCurve(): void {
        this.endX = this.startX + this.length * Math.cos(this.controlPointParameter)
        this.endY = this.startY + this.length * Math.sin(this.controlPointParameter)

        this.ctx.beginPath()
        this.ctx.moveTo(this.startX, this.startY)
        this.ctx.lineTo(this.endX, this.endY)
        this.ctx.lineWidth = 1
        this.ctx.stroke()

        this.drawArrowHead()
    }

    protected drawArrowHead(): void {
        // TODO FIX THIS ******
        const headLength = 60
        const headAngle = Math.PI / 20
        const headPoint1X = this.endX - headLength * Math.cos(this.controlPointParameter - headAngle)
        const headPoint1Y = this.endY - headLength * Math.sin(this.controlPointParameter - headAngle)
        const headPoint2X = this.endX - headLength * Math.cos(this.controlPointParameter + headAngle)
        const headPoint2Y = this.endY - headLength * Math.sin(this.controlPointParameter + headAngle)

        this.ctx.beginPath()
        this.ctx.moveTo(this.startX, this.startY)
        this.ctx.lineTo(headPoint1X, headPoint1Y)
        this.ctx.lineTo(headPoint2X, headPoint2Y)
        this.ctx.closePath()
        this.ctx.fillStyle = this.defaultColor
        this.ctx.fill()
    }

    protected updateControlPoint(): void {
        // this.controlPointParameter is the angle
        this.startX = this.circleTo.getX() + 
                    this.circleTo.getRadius() * Math.cos(this.controlPointParameter)
        this.startY = this.circleTo.getY() + 
                    this.circleTo.getRadius() * Math.sin(this.controlPointParameter)
    }

    public isCurveClickedAt(x: number, y: number): boolean {
        const distance = Math.sqrt(Math.pow(x - this.endX, 2) + Math.pow(y - this.endY, 2));
        return distance <= this.length
    }

    public recalculateCurveViaDraggingPointAt(x: number, y: number): void {
        this.controlPointParameter = 
                    this.angleBetweenPoints(this.circleTo.getX(), this.circleTo.getY(), x, y)
    }
    
    protected drawLabel(): void {
        return
    }

    public isLabelClickedAt(x: number, y: number): boolean {
        return false
    }

    public getLabelPosition(): { x: number; y: number } {
        return {x: this.endX, y: this.endY}
    }

    public setLabelVisibility(b: boolean): void {
        this.isLabelVisible = false
    }
}

class StateController {
    private circle: Circle
    private state: State
    private isFinal: boolean = false
    private id: number
    
    constructor(ctx: CanvasRenderingContext2D, id: number, label: string, x: number = 0, y: number = 0) {
        this.id = id
        this.circle = new Circle(ctx)
        this.state = new State(id)
        this.circle.setPosition(x, y)
        this.circle.setLabel(label)
    }

    public draw(): void {
        this.circle.draw()
    }

    public getCircle(): Circle {
        return this.circle
    }

    public getUnions(): Array<Union> {
        return this.state.getUnions()
    }
    
    public getState(): State {
        return this.state
    }

    public getId(): number {
        return this.id
    }
    
    public getName(): string {
        return this.circle.getLabel()
    }
    
    public setName(label: string): void {
        this.circle.setLabel(label)
    }
    
    public setFinal(b: boolean): void {
        this.isFinal = b
        this.circle.setInnerCircle(b)
    }

    public setHideLabel(b: boolean): void {
        this.circle.setHideLabel(b)
    }
    
    public isFinalState(): boolean {
        return this.isFinal
    }

    public setHighlight(b: boolean): void {
        this.circle.setHighlight(b)
    }
    
    public joinWasPerformed(toState: StateController, symbol: string): void {
        this.state.join(toState.getState(), symbol)
    }

    public disjoinWasPerformed(toState: StateController, symbol: string): void {
        this.state.disjoin(toState.getState(), symbol)
    }

    public setPosition(x: number, y: number): void {
        this.circle.setPosition(x, y)
    }

    public getPosition(): {x: number, y: number} {
        return this.circle.getPosition()
    }

    public transition(symbol: string): State | undefined {
        return this.state.transition(symbol)
    }

    public isClickedAt(x: number, y: number): boolean {
        return this.circle.isPointInside(x, y)
    }

    public dwarf(): void {
        this.setHideLabel(true)
        this.circle.dwarf()
    }
}

class UnionComposite {
    private ctx: CanvasRenderingContext2D
    private fromState: StateController | undefined
    private toState: StateController
    private arrow: Arrow
    private id: number

    constructor(ctx: CanvasRenderingContext2D, id: number, fromState: StateController | undefined, toState: StateController) {
        this.ctx = ctx
        this.id = id
        this.fromState = fromState
        this.toState = toState
        let arrowFactory: ArrowFactory = new ArrowFactory(this.ctx, fromState, toState)
        this.arrow = arrowFactory.createArrow()
        // This parameter or 'bias' makes every union arrow between states be randomly skewed
        this.arrow.setControlPointParameter((Math.random() * 80) * (-1) ** Math.floor(Math.random() * 2))
        this.updateArrow()
    }

    public drawUnion() {
        let unionsToState: Array<Union> = this.getUnionsToState()
        this.updateArrow()
        this.arrow.setLabel(this.getLabelsOf(unionsToState).join(', '))
        this.arrow.draw()
    }

    // TODO updateArrow() should only be called once
    private updateArrow(): void {
        if (this.fromState != undefined) this.arrow.setCircleFrom(this.fromState.getCircle())
        this.arrow.setCircleTo(this.toState.getCircle())
    }

    public getStateFrom(): StateController | undefined {
        return this.fromState
    }

    public getStateTo(): StateController {
        return this.toState
    }

    public getUnions(): Array<Union> {
        return this.getUnionsToState()
    }

    private getUnionsToState(): Array<Union> {
        if (this.fromState == undefined) return [] 
        let unions: Array<Union> = this.fromState.getUnions()
        let unionsToState: Array<Union> = new Array<Union>

        for (let union of unions) {
            if (union.getState() == this.toState.getState()) {
                unionsToState.push(union)
            }
        }

        return unionsToState
    }

    public getArrow(): Arrow {
        return this.arrow
    }
    
    public getId(): number {
        return this.id
    }

    public setLabelVisible(b: boolean): void {
        this.arrow.setLabelVisibility(b)
    }

    private getLabelsOf(unions: Array<Union>): String[] {
        let symbols: String[] = []
        
        for (let union of unions) {
            symbols.push(union.getSymbol().toString())
        }

        return symbols
    }

    public setHighlight(b: boolean): void {
        this.arrow.setHighlight(b)
    }

    public isClickedAt(x: number, y: number): boolean {
        return this.arrow.isCurveClickedAt(x, y)
    }

    public isLabelClickedAt(x: number, y: number): boolean {
        return this.arrow.isLabelClickedAt(x, y)
    }

    public recalculateCurveViaDraggingPointAt(x: number, y: number): void {
        this.arrow.recalculateCurveViaDraggingPointAt(x, y)
    }

    public isLabelVisible(): boolean {
        return this.arrow.getLabelVisibility()
    }
}

const run_animation_btn = <HTMLButtonElement> document.querySelector('.run_animation_btn')
const canvas = <HTMLCanvasElement> document.getElementById("canvas")
const ctx = <CanvasRenderingContext2D> canvas.getContext("2d")

let mousePos: {x: number, y: number}

// Function to get the mouse position relative to the canvas
function getMousePos(event: MouseEvent): {x: number, y: number} {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    }
}

class AutomataController {
    private states: Array<StateController> = new Array<StateController>
    private unions: Array<UnionComposite> = new Array<UnionComposite>
    private ctx: CanvasRenderingContext2D
    private initialState: StateController | undefined
    private currentState: StateController | undefined
    private finalStates: Array<StateController> = new Array<StateController>
    private dwarfState: StateController | undefined

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx
    }

    public createState(name: string, x: number = 0, y: number = 0): StateController {
        let state = new StateController(this.ctx, this.states.length, name, x, y)
        this.states.push(state)
        return state
    }

    // The dwarf state is an auxiliary state whose purpose is to be 
    // the guide of a new union being created between two existing states
    // It's called 'dwarf' because on canvas it is a really tiny circle 
    public createDwarfState(x: number, y: number): StateController {
        let dwarfState = new StateController(this.ctx, this.states.length, 'dwarf', x, y)
        this.states.push(dwarfState)
        this.dwarfState = dwarfState
        this.dwarfState.dwarf()
        return dwarfState
    }

    private findState(state: StateController | string): StateController | undefined {
        if (typeof state === "string") {
            return this.findStateByName(state)
        } else {
            return state
        }
    }

    public join(fromState: StateController | string, toState: StateController | string, symbol: string): boolean {
        let foundState: StateController | undefined
        foundState = this.findState(fromState)
        if (foundState == undefined) return false
        fromState = foundState

        foundState = this.findState(toState)
        if (foundState == undefined) return false
        toState = foundState

        // TODO Fix in case a fromState AND toState AND symbol is duplicate
        // The automata notifies each state everytime a join is made
        fromState.joinWasPerformed(toState, symbol)
        // At the same time it is ensured that there are no union duplicates  
        for (let union of this.unions) {
            if (union.getStateFrom() == fromState && union.getStateTo() == toState) {
                return true
            }
        }
        this.unions.push(new UnionComposite(ctx, this.unions.length, fromState, toState))
        return true
    }

    // Disjoin will not perform the removal of the union composite, it should not be its duty
    public disjoin(fromState: StateController | string, toState: StateController | string, symbol: string): boolean {
        let foundState: StateController | undefined
        foundState = this.findState(fromState)
        if (foundState == undefined) return false
        fromState = foundState

        foundState = this.findState(toState)
        if (foundState == undefined) return false
        toState = foundState

        fromState.disjoinWasPerformed(toState, symbol)
        return true
    }

    public removeUnionComposite(unionComposite: UnionComposite): boolean {
        let stateFrom = unionComposite.getStateFrom()
        if (stateFrom == undefined) return this.removeInitialState()

        for (let union of unionComposite.getUnions()) {
            this.disjoin(stateFrom.getName(), unionComposite.getStateTo().getName(), union.getSymbol())
        }

        return this.unions.splice(this.unions.indexOf(unionComposite), 1).length > 0
    }

    public removeState(state: StateController | string): boolean {
        let foundState: StateController | undefined = this.findState(state)
        if (foundState == undefined) return false
        state = foundState

        let unionsToRemove: Array<UnionComposite> = []
        
        for (let unionComposite of this.getUnionComposites()) {
            if (unionComposite.getStateFrom() == state || unionComposite.getStateTo() == state) {
                unionsToRemove.push(unionComposite)
            }
        }
        
        for (let unionComposite of unionsToRemove) {
            this.removeUnionComposite(unionComposite)
        }

        return this.states.splice(this.states.indexOf(state), 1).length > 0
    }

    public removeDwarfState(): boolean {
        if (this.dwarfState == undefined) return false
        return this.removeState(this.dwarfState)
    }

    public getDwarfState(): StateController | undefined {
        return this.dwarfState
    }

    public findStateByName(name: string): StateController | undefined {
        for (let state of this.states) {
            if (state.getName() == name) {
                return state
            }
        }
        return undefined
    }

    public setInitialState(state: StateController| string): boolean {
        let foundState: StateController | undefined = this.findState(state)
        if (foundState == undefined) return false
        state = foundState

        this.initialState = state
        this.removeInitialState()
        this.unions.push(new UnionComposite(ctx, this.unions.length, undefined, state))
        this.currentState = state
        return true
    }

    private removeInitialState(): boolean{
        for (let union of this.unions) {
            if (union.getStateFrom() == undefined) {
                return this.unions.splice(this.unions.indexOf(union), 1).length > 0
            }
        }
        return false
    }

    public addFinalState(state: StateController): boolean {
        this.finalStates.push(state)
        state.setFinal(true)
        return true
    }

    public removeFinalState(state: StateController): boolean {
        state.setFinal(false)
        this.finalStates.splice(this.finalStates.indexOf(state), 1)
        return true
    }

    public setFinalState(state: StateController | string): boolean {
        let foundState: StateController | undefined = this.findState(state)
        if (foundState == undefined) return false
        state = foundState

        if (state.isFinalState()) {
            return this.removeFinalState(state)
        } else {
            return this.addFinalState(state)
        }
    }

    public getControllerFromState(state: State): StateController | undefined {
        for (let controller of this.states) {
            if (controller.getState().getId() == state.getId()) {
                return controller
            }
        }
        return undefined
    }

    public getUnionComposites(): Array<UnionComposite> {
        return this.unions
    }

    public getStates(): Array<StateController> {
        return this.states
    }

    public drawElements(): void {
        this.drawUnions()
        this.drawStates()
    }

    private drawUnions(): void {
        for (let union of this.unions) {
            union.drawUnion()
        }
    }

    private drawStates(): void {
        for (let state of this.states) {
            state.draw()
        }
    }

    public clear(): void {
        this.states = new Array<StateController>
        this.unions = new Array<UnionComposite>
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    public getCurrentState(): StateController | undefined {
        return this.currentState
    }

    public getInitialState(): StateController | undefined {
        return this.initialState
    }

    public setCurrentState(state: StateController | undefined): void {
        this.currentState = state
    }

    public findUnionComposite(fromState: StateController, toState: StateController): UnionComposite | null {
        for (let unionComposite of this.unions) {
            if (unionComposite.getStateFrom() == fromState && unionComposite.getStateTo() == toState) {
                return unionComposite
            }
        }
        return null
    }
}

class AutomataAnimator {
    private automata: AutomataController
    private currentUnion: UnionComposite
    private transitionSpeed: number = 100
    private flickerSpeed: number = 125

    constructor(automata: AutomataController) {
        this.automata = automata
    }

    private sleep(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
    
    private async highlightState(b: boolean, ms: number) {
        this.automata.getCurrentState()?.setHighlight(b)
        reloadCanvas()
        await this.sleep(ms)
    }
    
    private async highlightUnion(b: boolean, ms: number) {
        this.currentUnion.setHighlight(b)
        reloadCanvas()
        await this.sleep(ms)
    }

    private async performStateFlickering() {
        for (let step of [0, 1, 2]) {
            await this.highlightState(true, this.flickerSpeed)
            await this.highlightState(false, this.flickerSpeed)
        }
    }

    private async performStateTransition() {
        await this.highlightState(true, this.transitionSpeed)
        await this.highlightState(false, 50)
    }

    // Just a shortener function
    private getCurrentState(): StateController | undefined {
        return this.automata.getCurrentState()
    }

    public async startAnimation(word: string): Promise<void> {
        this.automata.setCurrentState(this.automata.getInitialState())
        if (this.getCurrentState() == undefined) {
            console.log("No initial state set!")
            return
        }

        console.log(`Processing word: "${word}"`)
        console.log("Initial state: " + this.getCurrentState()?.getName())
        
        await this.performStateFlickering()
        await this.performStateTransition()

        for (let symbol of word) {
            let oldState = this.getCurrentState()

            let capturedState: State | undefined = this.getCurrentState()?.transition(symbol)
            if (capturedState == undefined) {
                console.log("An invalid state was processed. Stopping animation")
                return
            }

            this.automata.setCurrentState(this.automata.getControllerFromState(capturedState))
            console.log(`"${symbol}" -> ${this.automata.getCurrentState()?.getName()}`)

            for (let union of this.automata.getUnionComposites()) {
                this.currentUnion = union
                if (this.currentUnion.getStateFrom() == oldState &&
                        this.currentUnion.getStateTo() == this.getCurrentState()) {
                    await this.highlightUnion(true, this.transitionSpeed)
                    await this.highlightUnion(false, this.transitionSpeed)
                }
            }
            await this.performStateTransition()
        }
        await this.performStateFlickering()
    }
}

let automata = new AutomataController(ctx)

const sample1_btn = <HTMLButtonElement> document.querySelector('.sample1_btn')
sample1_btn.addEventListener('click', () => {
    console.log("Sample 1 button pressed!")
    automata.clear()

    let a = automata.createState('a')
    let b = automata.createState('b')

    a.setPosition(200, 300)
    b.setPosition(500, 300)

    automata.setInitialState('a')
    automata.setFinalState('b')

    automata.join('a', 'a', '0')
    automata.join('a', 'b', '1')
    automata.join('b', 'a', '1')
    automata.join('b', 'b', '0')

    automata.drawElements()
    reloadCanvas()
})

const sample2_btn = <HTMLButtonElement> document.querySelector('.sample2_btn')
sample2_btn.addEventListener('click', () => {
    console.log("Sample 2 button pressed!")
    automata.clear()

    let q = automata.createState('q')
    let r = automata.createState('r')
    let s = automata.createState('s')
    let t = automata.createState('t')
    let u = automata.createState('u')

    automata.setInitialState('q')
    automata.setFinalState('t')
    automata.setFinalState('u')

    q.setPosition(100, 300)
    r.setPosition(100, 500)
    s.setPosition(300, 300)
    t.setPosition(500, 300)
    u.setPosition(700, 300)

    automata.join('q', 'r', 'a')
    automata.join('q', 's', 'b')

    automata.join('r', 'r', 'a')
    automata.join('r', 'r', 'b')

    automata.join('s', 'r', 'a')
    automata.join('s', 't', 'b')

    automata.join('t', 'u', 'a')
    automata.join('t', 's', 'b')

    automata.join('u', 'u', 'a')
    automata.join('u', 'u', 'b')

    automata.drawElements()
    reloadCanvas()
})

const sample3_btn = <HTMLButtonElement> document.querySelector('.sample3_btn')
sample3_btn.addEventListener('click', () => {
    console.log("Sample 3 button pressed!")
    automata.clear()

    automata.createState('0', 100, 200)
    automata.createState('1', 250, 200)
    automata.createState('2', 400, 200)
    automata.createState('3', 550, 200)
    automata.createState('4', 700, 200)
    automata.createState('5', 100, 500)
    automata.createState('6', 250, 500)
    automata.createState('7', 400, 450)
    automata.createState('8', 550, 500)
    automata.createState('9', 700, 500)

    automata.setInitialState('0')
    automata.setFinalState('4')
    automata.setFinalState('8')

    automata.join('0', '1', 'a')
    automata.join('0', '0', 'b')
    automata.join('0', '5', 'c')

    automata.join('1', '0', 'a')
    automata.join('1', '0', 'b')
    automata.join('1', '2', 'c')

    automata.join('2', '3', 'a')
    automata.join('2', '5', 'b')
    automata.join('2', '5', 'c')

    automata.join('3', '3', 'a')
    automata.join('3', '3', 'b')
    automata.join('3', '4', 'c')

    automata.join('4', '4', 'a')
    automata.join('4', '4', 'b')
    automata.join('4', '3', 'c')

    automata.join('5', '6', 'a')
    automata.join('5', '5', 'b')
    automata.join('5', '0', 'c')

    automata.join('6', '5', 'a')
    automata.join('6', '5', 'b')
    automata.join('6', '7', 'c')

    automata.join('7', '8', 'a')
    automata.join('7', '0', 'b')
    automata.join('7', '0', 'c')

    automata.join('8', '8', 'a')
    automata.join('8', '8', 'b')
    automata.join('8', '9', 'c')

    automata.join('9', '9', 'a')
    automata.join('9', '9', 'b')
    automata.join('9', '8', 'c')

    automata.drawElements()
    reloadCanvas()
})

const sample4_btn = <HTMLButtonElement> document.querySelector('.sample4_btn')
sample4_btn.addEventListener('click', () => {
    console.log("Sample 4 button pressed!")
    automata.clear()

    automata.createState('0', 200, 200)
    automata.createState('1', 500, 500)

    automata.setInitialState('0')
    automata.setFinalState('1')
    
    automata.join('0', '1', 'a')

    automata.drawElements()
    reloadCanvas()
})

sample4_btn.click()

const test_btn = <HTMLButtonElement> document.querySelector('.test_btn')
test_btn.addEventListener('click', () => {
    console.log("Test button pressed!")
    automata.clear()
    reloadCanvas()
})

let wordInputBox = document.getElementById('wordInputBox') as HTMLInputElement | null

run_animation_btn.addEventListener('click', () => {
    let word = wordInputBox ? wordInputBox?.value : ''
    let automataAnimator: AutomataAnimator = new AutomataAnimator(automata)
    automataAnimator.startAnimation(word)
})

canvas.addEventListener("click", (event) => {
    mousePos = getMousePos(event)
    console.log("Clicked at x: " + mousePos.x + " y: " + mousePos.y)
})

function reloadCanvas() {
    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    automata.drawElements()
}

let selectedFromState: StateController | null = null
let selectedState: StateController | null = null
let stateHasBeenSelected: boolean = false
let stateHasBeenDragged: boolean = false

let selectedUnionComposite: UnionComposite | null = null
let unionHasBeenSelected: boolean = false

let unionHasBeenDragged: boolean = false
let unionIsBeingCreated: boolean = false

let stateLabelIsBeingEdited: boolean = false
let stateLabelCurrentPosition: {x: number, y: number} | null = null
let unionLabelIsBeingEdited: boolean = false
let unionLabelCurrentPosition: {x: number, y: number} | null = null

// Moving a state event
canvas.addEventListener('mousedown', (event) => {
    if (!stateHasBeenSelected && !stateLabelIsBeingEdited) {
        mousePos = getMousePos(event)
        for (let state of automata.getStates()) {
            if (state.isClickedAt(mousePos.x, mousePos.y)) {
                selectedState = state
                stateHasBeenSelected = true
                break
            }
        }
    }
})

// Moving an arrow event
canvas.addEventListener('mousedown', (event) => {
    if (!unionHasBeenSelected && !stateHasBeenSelected && !unionLabelIsBeingEdited) {
        mousePos = getMousePos(event)
        for (let unionComposite of automata.getUnionComposites()) {
            if (unionComposite.isClickedAt(mousePos.x, mousePos.y)) {
                selectedUnionComposite = unionComposite
                unionHasBeenSelected = true
                break
            }
        }
    }
})

canvas.addEventListener('mousedown', (event) => {
    if (!unionIsBeingCreated) {
        mousePos = getMousePos(event)
        for (let state of automata.getStates()) {
            if (event.shiftKey && state.isClickedAt(mousePos.x, mousePos.y)) {
                unionIsBeingCreated = true
                selectedState = automata.createDwarfState(mousePos.x, mousePos.y)
                selectedFromState = state
                automata.join(state, selectedState, '')
                break
            }
        }
    }
})

canvas.addEventListener('mousemove', (event) => {
    if (stateHasBeenSelected) {
        if (selectedState == null) return
        stateHasBeenDragged = true
        const previusMousePos = mousePos
        mousePos = getMousePos(event)
        const dx = mousePos.x - previusMousePos.x
        const dy = mousePos.y - previusMousePos.y
        const currentStatePosition = selectedState.getPosition()
        selectedState.setPosition(currentStatePosition.x + dx, currentStatePosition.y + dy)
        reloadCanvas()
    }
})

canvas.addEventListener('mousemove', (event) => {
    if (unionHasBeenSelected && !stateHasBeenSelected) {
        if (selectedUnionComposite == null) return
        unionHasBeenDragged = true
        mousePos = getMousePos(event)
        selectedUnionComposite.recalculateCurveViaDraggingPointAt(mousePos.x, mousePos.y)
        reloadCanvas()
    }
})

canvas.addEventListener('mouseup', (event) => {
    stateLabelCurrentPosition = null
    unionLabelCurrentPosition = null
    unionHasBeenSelected = false
    stateHasBeenSelected = false
    
    if (unionIsBeingCreated) {
        mousePos = getMousePos(event)
        for (let state of automata.getStates()) {
            if (state.isClickedAt(mousePos.x, mousePos.y) && state != automata.getDwarfState()) {
                if (selectedState != null && selectedFromState != null) {
                    automata.join(selectedFromState, state, '')
                    selectedUnionComposite = automata.findUnionComposite(selectedFromState, state)
                    displayUnionLabelInputBox(selectedUnionComposite)
                }
            }
        }
        automata.removeDwarfState()
        reloadCanvas()
    }

    // If a union has not been dragged then only has been tapped on
    if (!unionHasBeenDragged) {
        selectedUnionComposite?.setLabelVisible(false)
        reloadCanvas()
        selectedUnionComposite?.setLabelVisible(true)
        
        displayUnionLabelInputBox(selectedUnionComposite)
    } else {
        selectedUnionComposite = null
    }
    
    unionHasBeenDragged = false
    
    // If a state has not been dragged then only has been tapped on
    if (!stateHasBeenDragged) {
        selectedState?.setHideLabel(true)
        reloadCanvas()
        selectedState?.setHideLabel(false)
        
        displayStateLabelInputBox(selectedState)
    } else {
        selectedState = null
    }
    
    stateHasBeenDragged = false

    unionIsBeingCreated = false
    selectedFromState = null
})

canvas.addEventListener('dblclick', (event) => {
    mousePos = getMousePos(event)

    for (let state of automata.getStates()) {
        if (state.isClickedAt(mousePos.x, mousePos.y)) {
            automata.setInitialState(state)
            return
        }
    }

    selectedState = automata.createState('', mousePos.x, mousePos.y)
    displayStateLabelInputBox(selectedState)
    reloadCanvas()
})

let stateLabelBox = document.getElementById('stateLabelBox') as HTMLInputElement
let unionLabelBox = document.getElementById('unionLabelBox') as HTMLInputElement

function displayUnionLabelInputBox(unionComposite: UnionComposite | null): void {
    if (unionComposite == null) return
    unionLabelIsBeingEdited = true
    let labelPos = unionComposite.getArrow().getLabelPosition()
    unionLabelCurrentPosition = labelPos
    
    unionLabelBox.style.left = `${unionLabelCurrentPosition.x + 2}px`
    unionLabelBox.style.top = `${unionLabelCurrentPosition.y - 4}px`
    unionLabelBox.style.display = 'block'
    unionLabelBox.focus()
}

function displayStateLabelInputBox(state: StateController | null): void {
    if (state == null) return
    stateLabelIsBeingEdited = true
    let labelPos = state.getPosition()
    stateLabelCurrentPosition = labelPos

    stateLabelBox.style.left = `${stateLabelCurrentPosition.x + 7}px`
    stateLabelBox.style.top = `${stateLabelCurrentPosition.y - 7}px`
    stateLabelBox.style.display = 'block'
    stateLabelBox.focus()
}

stateLabelBox.addEventListener('input', () => {
    if (stateLabelCurrentPosition == null) return 
    const inputWidth = stateLabelBox.value.length * 10

    stateLabelBox.style.left = `${stateLabelCurrentPosition.x - inputWidth / 2 + 5}px`
})

stateLabelBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        stateLabelBox.blur()
    }
})

stateLabelBox.addEventListener('blur', () => {
    stateLabelBox.value = stateLabelBox.value.trim()
    if (stateLabelBox.value == '') {
        console.log("State label not valid")
        stateLabelBox.style.display = 'none'

        selectedState = null
        stateLabelIsBeingEdited = false
        return
    }

    selectedState?.setName(stateLabelBox.value)
    stateLabelBox.style.display = 'none'
    stateLabelBox.value = ''
    reloadCanvas()

    selectedState = null
    stateLabelIsBeingEdited = false
})

unionLabelBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.keyCode === 13) {
        unionLabelBox.blur()
    }
})

unionLabelBox.addEventListener('blur', () => {
    unionLabelBox.value = unionLabelBox.value.trim()
    if (unionLabelBox.value == '') {
        console.log("Union label not valid")
        unionLabelBox.style.display = 'none'
        reloadCanvas()

        selectedUnionComposite = null
        unionLabelIsBeingEdited = false        
        return
    }
    
    if (selectedUnionComposite == null) {console.log("No union composite is selected"); return}
    let stateFrom = selectedUnionComposite.getStateFrom()
    if (stateFrom == null) {console.log("stateFrom of the union composite is null"); return}

    // This is how the next section works:
    // 1. Get all unions related to the union composite
    // 2. Disjoin them (exactly the same as deleting them)
    // 3. Add new unions based on the input box value

    for (let union of selectedUnionComposite.getUnions()) {
        automata.disjoin(stateFrom, selectedUnionComposite.getStateTo(), union.getSymbol())
    }

    for (let symbol of unionLabelBox.value.split(',')) {
        automata.join(stateFrom, selectedUnionComposite.getStateTo(), symbol)
    }

    // Reset the input box
    unionLabelBox.value = ''
    unionLabelBox.style.display = 'none'
    reloadCanvas()

    selectedUnionComposite = null
    unionLabelIsBeingEdited = false
})

