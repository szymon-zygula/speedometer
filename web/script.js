const CANVAS_SIZE = 400;
const SERVER_ADDRESS = "localhost:1234";
const HALF_CANVAS_SIZE = CANVAS_SIZE / 2;

const PLOT_COLOR = 'red';
const MARK_LENGTH = 10;

const Y_AVAILABLE_SPACE = CANVAS_SIZE - 80;
const Y_AXIS_OFFSET = 20;
const Y_AXIS_MARK_COUNT = 10;
const Y_DOMAIN_CM_PER_S = 200;
const Y_MARK_STEP_CM_PER_S = Y_DOMAIN_CM_PER_S / Y_AXIS_MARK_COUNT;
const Y_MARK_SPACE_LENGTH = Y_AVAILABLE_SPACE / Y_AXIS_MARK_COUNT;

const X_AVAILABLE_SPACE = CANVAS_SIZE - Y_AXIS_OFFSET - 50;
const X_DOMAIN_S = 60;
const X_AXIS_MARK_COUNT = 10;
const X_MARK_STEP_S = X_DOMAIN_S / X_AXIS_MARK_COUNT;
const X_MARK_SPACE_LENGTH = X_AVAILABLE_SPACE / X_AXIS_MARK_COUNT;

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

const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
};

const xToCanvas = (x) => {
    return (x / X_DOMAIN_S) * X_AVAILABLE_SPACE + Y_AXIS_OFFSET;
}

const yToCanvas = (y) => {
    return HALF_CANVAS_SIZE - (y / Y_DOMAIN_CM_PER_S) * Y_AVAILABLE_SPACE;
};

const drawPlot = (ctx, xs, ys) => {
    const oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = PLOT_COLOR;

    for (let i = 1; i < xs.length; ++i) {
        drawLine(ctx,
            xToCanvas(xs[i - 1]),
            yToCanvas(ys[i - 1]),
            xToCanvas(xs[i]),
            yToCanvas(ys[i])
        );
    }

    ctx.strokeStyle = oldStyle;
};

const drawXMarks = (ctx) => {
    for (let i = 0; i < X_AXIS_MARK_COUNT; ++i) {
        const x = Y_AXIS_OFFSET + (i + 1) * X_MARK_SPACE_LENGTH;
        drawLine(ctx, x, HALF_CANVAS_SIZE - MARK_LENGTH / 2, x, HALF_CANVAS_SIZE + MARK_LENGTH / 2);
        ctx.strokeText(
            ((i + 1) * X_MARK_STEP_S).toFixed(1),
            x - 10,
            HALF_CANVAS_SIZE + MARK_LENGTH / 2 + 10
        );
    }
}

const drawYMarksWithDir = (ctx, dir) => {
    for (let i = 0; i < Y_AXIS_MARK_COUNT / 2; ++i) {
        const y = HALF_CANVAS_SIZE - dir * (i + 1) * Y_MARK_SPACE_LENGTH;
        drawLine(ctx, Y_AXIS_OFFSET - MARK_LENGTH / 2, y, Y_AXIS_OFFSET + MARK_LENGTH / 2, y);
        ctx.strokeText(
            (dir * (i + 1) * Y_MARK_STEP_CM_PER_S).toFixed(1),
            Y_AXIS_OFFSET + MARK_LENGTH / 2 + 5, y + 2.5
        );
    }
}

const drawYMarks = (ctx) => {
    drawYMarksWithDir(ctx, 1);
    drawYMarksWithDir(ctx, -1);
}

const drawAxes = (ctx) => {
    drawLine(ctx, 0, HALF_CANVAS_SIZE, CANVAS_SIZE, HALF_CANVAS_SIZE); // X
    drawLine(ctx, Y_AXIS_OFFSET, 0, Y_AXIS_OFFSET, CANVAS_SIZE); // Y

    ctx.strokeText("t [s]", CANVAS_SIZE - 25, HALF_CANVAS_SIZE + 15);
    ctx.strokeText("v [cm/s]", Y_AXIS_OFFSET + 5, 15);

    drawXMarks(ctx);
    drawYMarks(ctx);
};

const drawGraph = (ctx, xs, ys) => {
    drawPlot(ctx, xs, ys);
    drawAxes(ctx);
};

const getNewData = () => {
    // Get data from server
}

const main = () => {
    const ctx = initCanvas();
    drawGraph(ctx, [10, 15, 20], [20, 60, 40]);
};

main();
