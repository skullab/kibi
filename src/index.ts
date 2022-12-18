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
	beforeUpdate(): void;
	update(deltaTime: number): void;
	afterUpadte(deltaTime: number): void;
}
export interface Renderable {
	render(): void;
}
export interface Triggerable {
	onTriggerEnter(gameObject: GameObject): void;
	onTriggerExit(gameObject: GameObject): void;
	onTriggerStay(gameObject: GameObject): void;
}
export interface Collisionable {
	onCollisionEnter(gameObject: GameObject): void;
	onCollisionExit(gameObject: GameObject): void;
	onCollisionStay(gameObject: GameObject): void;
}
export interface Initializable {
	onInitialize(): void;
}
export abstract class GameObject
	implements Initializable, Uptadable, Renderable, Collisionable, Triggerable
{
	protected ctx: CanvasRenderingContext2D;
	protected engine: Engine2D;
	protected dimension: Dimension = { width: 0, height: 0 };
	protected position: Position = { x: 0, y: 0 };
	protected velocity: Velocity = { x: 0, y: 0 };
	protected colliders: Collider[] = [];
	protected name: string = "gameObject";
	protected tags: string[] = [];
	constructor(engine: Engine2D) {
		this.engine = engine;
		this.ctx = engine.ctx;
		this.onInitialize();
	}
	abstract onInitialize(): void;
	beforeUpdate(): void {}
	abstract update(deltaTime: number): void;
	afterUpadte(deltaTime: number): void {}
	abstract render(): void;
	getDimension(): Dimension {
		return this.dimension;
	}
	getPosition(): Position {
		return this.position;
	}
	getVelocity(): Velocity {
		return this.velocity;
	}
	addCollider(collider: Collider) {
		if (collider.dimension === undefined) {
			collider.dimension = this.dimension;
		}
		collider.gameObject = this;
		collider.ctx = this.ctx;
		this.colliders.push(collider);
	}
	getColliders(): Collider[] {
		return this.colliders;
	}
	getName(): string {
		return this.name;
	}
	getTags(): string[] {
		return this.tags;
	}
	move(position: Position) {
		this.position.x += position.x;
		this.position.y += position.y;
	}
	onCollisionEnter(gameObject: GameObject): void {}
	onCollisionExit(gameObject: GameObject): void {}
	onCollisionStay(gameObject: GameObject): void {}
	onTriggerEnter(gameObject: GameObject): void {}
	onTriggerExit(gameObject: GameObject): void {}
	onTriggerStay(gameObject: GameObject): void {}
}
export interface Collider extends Renderable {
	position: Position | undefined;
	dimension: Dimension | undefined;
	ctx: CanvasRenderingContext2D | undefined;
	gameObject: GameObject | undefined;
	visible: boolean;
	trigger: boolean;
	detectCollision(gameObject: GameObject): void;
}
export interface ColliderOptions {
	position?: Position;
	dimension?: Dimension;
	ctx?: CanvasRenderingContext2D;
	gameObject?: GameObject;
	visible?: boolean;
	trigger?: boolean;
}
export class BoxCollider implements Collider {
	position: Position | undefined;
	dimension: Dimension | undefined;
	visible: boolean;
	trigger: boolean;
	ctx: CanvasRenderingContext2D | undefined;
	gameObject: GameObject | undefined;
	colliders: Collider[] = [];
	constructor(options?: ColliderOptions) {
		this.position = options?.position || { x: 0, y: 0 };
		this.dimension = options?.dimension;
		this.ctx = options?.ctx;
		this.gameObject = options?.gameObject;
		this.visible = options?.visible || false;
		this.trigger = options?.trigger || false;
	}
	render() {
		if (
			this.ctx &&
			this.visible &&
			this.gameObject &&
			this.position &&
			this.dimension
		) {
			this.ctx.strokeStyle = "rgba(0,255,0,0.5)";
			this.ctx.strokeRect(
				this.gameObject.getPosition().x + this.position.x,
				this.gameObject.getPosition().y + this.position.y,
				this.dimension.width,
				this.dimension.height
			);
		}
	}
	detectCollision(gameObject: GameObject) {
		if (this.gameObject === gameObject) {
			return;
		}
		let checkColliders: Collider[] = [];
		gameObject.getColliders().forEach((collider) => {
			if (
				this.gameObject &&
				this.position &&
				this.dimension &&
				collider.gameObject &&
				collider.position &&
				collider.dimension
			) {
				let p = this.gameObject.getPosition();
				let v = this.gameObject.getVelocity();
				let c = collider.gameObject.getPosition();
				let d = collider.gameObject.getVelocity();
				let check1X =
					p.x + this.position.x + this.dimension.width >
					c.x + collider.position.x;
				let check1Y =
					p.y + this.position.y + this.dimension.height >
					c.y + collider.position.y;
				let check2X =
					p.x + this.position.x <
					c.x + collider.position.x + collider.dimension.width;
				let check2Y =
					p.y + this.position.y <
					c.y + collider.position.y + collider.dimension.height;
				if (check1X && check1Y && check2X && check2Y) {
					checkColliders.push(collider);
				}
			}
		});

		let enterColliders = checkColliders.filter((collider) => {
			return this.colliders.indexOf(collider) == -1;
		});
		let stayCollider = checkColliders.filter((collider) => {
			return this.colliders.indexOf(collider) != -1;
		});
		let exitCollider = this.colliders.filter((collider) => {
			return checkColliders.indexOf(collider) == -1;
		});

		enterColliders.forEach((collider) => {
			if (this.trigger) {
				this.gameObject?.onTriggerEnter(gameObject);
			} else {
				this.gameObject?.onCollisionEnter(gameObject);
			}
		});

		stayCollider.forEach((collider) => {
			if (this.trigger) {
				this.gameObject?.onTriggerStay(gameObject);
			} else {
				this.gameObject?.onCollisionStay(gameObject);
			}
		});

		exitCollider.forEach((collider) => {
			if (this.trigger) {
				this.gameObject?.onTriggerExit(gameObject);
			} else {
				this.gameObject?.onCollisionExit(gameObject);
			}
		});

		this.colliders = checkColliders;
	}
}
export class Scene implements Renderable, Uptadable {
	protected gameObjects: GameObject[] = [];
	protected name: string = "";
	protected tags: string[] = [];
	addGameObject(gameObject: GameObject): number {
		this.gameObjects.push(gameObject);
		return this.getGameObjectIndex(gameObject);
	}
	removeGameObject(gameObject: GameObject): boolean {
		let index = this.getGameObjectIndex(gameObject);
		if (index != -1) {
			this.gameObjects.splice(index, 1);
			return true;
		}
		return false;
	}
	getGameObjectIndex(gameObject: GameObject): number {
		return this.gameObjects.indexOf(gameObject);
	}
	render(): void {
		this.gameObjects.forEach((gameObject) => {
			gameObject.render();
			gameObject.getColliders().forEach((collider) => {
				collider.render();
			});
		});
	}
	beforeUpdate(): void {
		this.gameObjects.forEach((gameObject) => {
			gameObject.getColliders().forEach((collider) => {
				this.gameObjects.forEach((gameObject) => {
					collider.detectCollision(gameObject);
				});
			});
			gameObject.beforeUpdate();
		});
	}
	update(deltaTime: number): void {
		this.gameObjects.forEach((gameObject) => {
			gameObject.update(deltaTime);
		});
	}
	afterUpadte(deltaTime: number): void {
		this.gameObjects.forEach((gameObject) => {
			gameObject.afterUpadte(deltaTime);
		});
	}
}
export class Engine2D implements Uptadable, Renderable {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	showFps: boolean = false;
	private startTimestamp: number | undefined;
	private lastTimestamp: number = 0;
	private estimatedFps: number = 0;
	private desiredFps: number = 0;
	private skippedFps: number = 0;
	private averageFps: number = 0;
	private stackFps: number[] = [];
	private deltaTime: number = 0;
	private elapsedTime: number = 0;
	private frameCounter: number = 0;
	private waitTime: number = 0;
	private waitInterval: number = 0;
	private currentFps: number = 0;
	private scenes: Scene[] = [];
	private currentSceneIndex: number = -1;
	private animationFrameIndex: number = 0;
	private executionTime: number = 0;
	private lastKeyboardEvent: KeyboardEvent | undefined;
	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
	}
	protected calculateFps(deltaTime: number) {
		this.estimatedFps = 1000 / deltaTime;
		this.waitTime = 1000 / this.desiredFps - deltaTime;
		this.waitTime =
			isFinite(this.waitTime) && this.waitTime > 0 ? this.waitTime : 0;
		this.waitInterval += deltaTime;
		if (this.waitInterval >= deltaTime + this.waitTime) {
			this.currentFps = 1000 / (deltaTime + this.waitTime);
			if (isFinite(this.currentFps)) {
				this.stackFps.push(this.currentFps);
				let sumFps = this.stackFps.reduce(
					(previous, current) => previous + current
				);
				this.averageFps =
					Math.floor((sumFps / this.stackFps.length) * 100) / 100;
				if (this.stackFps.length >= 120) {
					this.stackFps.splice(0, 60);
				}
			}
			this.skippedFps = this.estimatedFps - this.currentFps;
			this.waitInterval = 0;
		}
	}
	protected renderFps() {
		this.ctx.save();
		this.ctx.font = "16px monospace";
		this.ctx.fillStyle = "black";
		this.ctx.fillText("fps : " + this.averageFps, 10, 20);
		this.ctx.fillStyle = "yellow";
		this.ctx.fillText("fps : " + this.averageFps, 10.8, 20.5);
		this.ctx.restore();
	}
	protected calculateTime(timestamp: number) {
		if (this.startTimestamp === undefined) {
			this.startTimestamp = timestamp;
		}
		this.deltaTime = timestamp - this.lastTimestamp;
		this.lastTimestamp = timestamp;
		this.elapsedTime = timestamp - this.startTimestamp;
	}
	getCurrentFps(): number {
		return this.currentFps;
	}
	getAverageFps(): number {
		return this.averageFps;
	}
	getEstimatedFps(): number {
		return this.estimatedFps;
	}
	getSkippedFps(): number {
		return this.skippedFps;
	}
	getElapsedTime(): number {
		return this.elapsedTime;
	}
	getFrameCounter(): number {
		return this.frameCounter;
	}
	addScene(scene: Scene): number {
		this.scenes.push(scene);
		let index = this.getSceneIndex(scene);
		if (this.currentSceneIndex == -1) {
			this.currentSceneIndex = index;
		}
		return index;
	}
	getSceneIndex(scene: Scene): number {
		return this.scenes.indexOf(scene);
	}
	removeScene(scene: Scene): boolean {
		let index = this.getSceneIndex(scene);
		if (index != -1) {
			this.scenes.splice(index, 1);
			return true;
		}
		return false;
	}
	setCurrentScene(scene: Scene) {
		this.currentSceneIndex = this.getSceneIndex(scene);
	}
	setCurrentSceneIndex(index: number) {
		this.currentSceneIndex = index;
	}
	getCurrentScene(): Scene | undefined {
		return this.scenes[this.currentSceneIndex];
	}
	protected updateInputs() {}
	protected beforeUpdateCurrentScene() {
		let currentScene = this.getCurrentScene();
		if (currentScene) {
			currentScene.beforeUpdate();
		}
	}
	protected updateCurrentScene(deltaTime: number) {
		let currentScene = this.getCurrentScene();
		if (currentScene) {
			currentScene.update(deltaTime);
		}
	}
	protected afterUpdateCurrentScene(deltaTime: number) {
		let currentScene = this.getCurrentScene();
		if (currentScene) {
			currentScene.afterUpadte(deltaTime);
		}
	}
	beforeUpdate(): void {
		let executionTimeStart = performance.now();
		this.updateInputs();
		this.beforeUpdateCurrentScene();
		this.executionTime = performance.now() - executionTimeStart;
	}
	update(deltaTime: number): void {
		this.updateCurrentScene(deltaTime);
	}
	afterUpadte(deltaTime: number): void {
		this.afterUpdateCurrentScene(deltaTime);
	}
	render(): void {
		++this.frameCounter;
		this.clearCanvas();
		this.renderCurrentScene();
		this.renderOverlay();
	}
	protected renderCurrentScene() {
		let currentScene = this.getCurrentScene();
		if (currentScene) {
			currentScene.render();
		}
	}
	protected clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	protected renderOverlay() {
		if (this.showFps) {
			this.renderFps();
		}
	}
	protected animate(timestamp: number = 0) {
		this.animationFrameIndex = requestAnimationFrame(this.animate.bind(this));
		this.executionTime = 0;
		this.beforeUpdate();
		this.calculateTime(timestamp);
		this.calculateFps(this.deltaTime);
		if (this.waitInterval == 0) {
			this.update(this.deltaTime);
			this.afterUpadte(this.deltaTime);
			this.render();
		}
	}
	protected onKeyDown(e: KeyboardEvent) {
		this.lastKeyboardEvent = e;
		console.log(this.lastKeyboardEvent);
	}
	protected onKeyUp(e: KeyboardEvent) {
		this.lastKeyboardEvent = e;
	}
	keyDown(key: string): boolean {
		return (
			this.lastKeyboardEvent?.type == "keydown" &&
			this.lastKeyboardEvent.key == key
		);
	}
	keyUp(key: string): boolean {
		return (
			this.lastKeyboardEvent?.type == "keyup" &&
			this.lastKeyboardEvent.key == key
		);
	}
	start(): void {
		window.addEventListener("keydown", this.onKeyDown.bind(this));
		window.addEventListener("keyup", this.onKeyUp.bind(this));
		this.animate();
	}
	stop() {
		cancelAnimationFrame(this.animationFrameIndex);
	}
	setFps(fps: number) {
		this.desiredFps = fps;
	}
}
