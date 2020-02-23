function render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, width, height);
}

export function* renderSaga() {
    const canvas = <HTMLCanvasElement>document.getElementById("gameView");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        render(ctx, canvas.width, canvas.height);
    }
}
