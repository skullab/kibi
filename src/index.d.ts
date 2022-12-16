export interface Dimension {
    width: number;
    height: number;
}
export interface Position {
    x: number;
    y: number;
}
export interface Velocity {
    x: number;
    y: number;
}
export interface Uptadable {
    update(deltaTime: number): void;
}
export interface Renderable {
    render(): void;
}
export interface Triggerable {
    onTriggerEnter(gameObject: GameObject): void;
}
export interface Collisionable {
    onCollisionEnter(gameObject: GameObject): void;
}
export declare abstract class GameObject implements Uptadable, Renderable, Collisionable, Triggerable {
    protected ctx: CanvasRenderingContext2D;
    protected dimension: Dimension;
    protected position: Position;
    protected velocity: Velocity;
    protected colliders: Collider[];
    protected name: string;
    protected tags: string[];
    constructor(canvasCtx: CanvasRenderingContext2D);
    abstract update(deltaTime: number): void;
    abstract render(): void;
    getDimension(): Dimension;
    getPosition(): Position;
    getVelocity(): Velocity;
    addCollider(collider: Collider): void;
    getColliders(): Collider[];
    getName(): string;
    getTags(): string[];
    onCollisionEnter(gameObject: GameObject): void;
    onTriggerEnter(gameObject: GameObject): void;
}
export interface Collider extends Renderable {
    position: Position;
    dimension: Dimension;
    visible: boolean;
    trigger: boolean;
    detectCollision(gameObject: GameObject): Collider[];
}
export declare class BoxCollider implements Collider {
    position: Position;
    dimension: Dimension;
    visible: boolean;
    trigger: boolean;
    ctx: CanvasRenderingContext2D | null;
    gameObject: GameObject | null;
    constructor(position: Position, dimension: Dimension, canvasCtx?: CanvasRenderingContext2D, gameObject?: GameObject);
    render(): void;
    detectCollision(gameObject: GameObject): Collider[];
}
export declare class Engine2D implements Uptadable, Renderable {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private lastTimestamp;
    private fps;
    private lastFps;
    private desiredFps;
    private skippedFps;
    private averageFps;
    private stackFps;
    private counterFps;
    constructor(canvas: HTMLCanvasElement);
    protected calculateFps(deltaTime: number): void;
    protected renderFps(): void;
    update(deltaTime: number): void;
    render(): void;
    start(timestamp?: number): void;
    setFps(fps: number): void;
}
