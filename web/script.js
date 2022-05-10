const CANVAS_SIZE = 300;
const SERVER_ADDRESS = "localhost:1234";

const initCanvas = () => {
    const canvas = document.getElementById("graph-canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    if (!canvas.getContext) {
        alert("Canvas nie jest wspierany");
        return;
    }

    return canvas.getContext("2d");
}

const getNewData = () => {
    // Get data from server
}

const drawPlot = (ctx, xs, ys) => {

};

const drawAxes = (ctx) => {

};

const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
};

const main = () => {
    const ctx = initCanvas();
    drawLine(ctx, 0, 0, 20, 100);
};

main();
