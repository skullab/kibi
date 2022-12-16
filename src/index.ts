export interface Dimension {
    width:number;
    height:number;
}
export interface Position {
    x:number;
    y:number;
}
export interface Velocity {
    x:number;
    y:number;
}
export interface Uptadable {
    update(deltaTime:number):void;
}
export interface Renderable {
    render():void;
}
export interface Triggerable {
    onTriggerEnter(gameObject:GameObject):void;
}
export interface Collisionable {
    onCollisionEnter(gameObject:GameObject):void;
}
export abstract class GameObject implements Uptadable,Renderable,Collisionable,Triggerable{
    protected ctx: CanvasRenderingContext2D;
    protected dimension:Dimension;
    protected position:Position;
    protected velocity:Velocity;
    protected colliders:Collider[] = [];
    protected name:string = "gameObject";
    protected tags:string[] = [];
    constructor(canvasCtx:CanvasRenderingContext2D){
        this.ctx = canvasCtx;
    }
    abstract update(deltaTime: number): void;
    abstract render():void;
    getDimension():Dimension{
        return this.dimension;
    }
    getPosition():Position{
        return this.position;
    }
    getVelocity():Velocity{
        return this.velocity;
    }
    addCollider(collider:Collider){
        this.colliders.push(collider);
    }
    getColliders():Collider[]{
        return this.colliders;
    }
    getName():string{
        return this.name;
    }
    getTags():string[]{
        return this.tags;
    }
    onCollisionEnter(gameObject: GameObject): void {}
    onTriggerEnter(gameObject: GameObject): void {}
}
export interface Collider extends Renderable {
    position: Position;
    dimension: Dimension;
    visible: boolean;
    trigger: boolean;
    detectCollision(gameObject:GameObject):Collider[];
}
export class BoxCollider implements Collider {
    position: Position;
    dimension: Dimension;
    visible: boolean;
    trigger: boolean;
    ctx: CanvasRenderingContext2D | null;
    gameObject: GameObject | null;
    constructor(position:Position,dimension:Dimension,canvasCtx?:CanvasRenderingContext2D,gameObject?:GameObject){
        this.position = position;
        this.dimension = dimension;
        this.ctx = canvasCtx;
        this.gameObject = gameObject;
        this.visible = false;
        this.trigger = false;
    }
    render(){
        if(this.ctx && this.visible){
            this.ctx.strokeStyle = "rgba(0,255,0,0.5)";
            this.ctx.strokeRect(this.position.x,this.position.y,this.dimension.width,this.dimension.height);
        }
    }
    detectCollision(gameObject: GameObject): Collider[] {
        let collision: Collider[] = [];
        gameObject.getColliders().forEach( collider => {
            let check1X = this.position.x + this.dimension.width > collider.position.x ;
            let check1Y = this.position.y + this.dimension.height > collider.position.y;
            let check2X = this.position.x < collider.position.x + collider.dimension.width;
            let check2Y = this.position.y < collider.position.y + collider.dimension.height;
            if(check1X && check1Y && check2X && check2Y){
                collision.push(collider);
            }
        });
        if(collision.length > 0 && this.gameObject){
            if(this.trigger){
                gameObject.onTriggerEnter(this.gameObject);
                this.gameObject.onTriggerEnter(gameObject);
            }else{
                gameObject.onCollisionEnter(this.gameObject);
                this.gameObject.onCollisionEnter(gameObject);
            }
        }
        return collision;
    }
}
export class Engine2D implements Uptadable,Renderable{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private lastTimestamp:number = 0;
    private fps:number = 0;
    private lastFps:number = 0;
    private desiredFps:number = 0;
    private skippedFps:number = 0;
    private averageFps:number = 0;
    private stackFps:number[] = [];
    private counterFps:number = 0;
    constructor(canvas:HTMLCanvasElement){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
    }
    protected calculateFps(deltaTime:number){
        this.fps = 1000 / deltaTime ;
        if(isFinite(this.fps)){
            this.stackFps.push(this.fps);
            let sumFps = 0;
            this.stackFps.forEach((fps) => { sumFps += fps });
            this.averageFps = Math.floor((sumFps / this.stackFps.length)*100) / 100;
            if(this.stackFps.length > 120){
                this.stackFps.splice(0,60);
            }
        }
        this.lastFps = this.fps;
        this.skippedFps = this.lastFps - this.desiredFps;
    }
    protected renderFps(){
        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "white";
        this.ctx.fillText("fps : "+this.averageFps,10,20);
    }
    update(deltaTime: number): void {
        this.calculateFps(deltaTime);
        
        
    }
    render(): void {
       this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
       this.ctx.fillStyle = "black";
       this.ctx.fillRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
       this.renderFps();
    }
    start(timestamp:number = 0):void{
        requestAnimationFrame(this.start.bind(this));
        let deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        this.update(deltaTime);
        this.counterFps += isFinite(this.skippedFps) ? this.skippedFps : 0;
        if(this.counterFps >= this.desiredFps){
            console.log(this.counterFps);
            this.counterFps = 0;
            this.render();
        }
        
    }
    setFps(fps:number){
        this.desiredFps = fps;
    }
}

let engine = new Engine2D(<HTMLCanvasElement>document.getElementById('main-canvas'));
engine.canvas.width = 500;
engine.canvas.height = 500;
engine.setFps(30);
engine.start();

