const MAIN_BUTTON_ID = 'main-button';

// 'ws://192.168.145.221:8888/socket';
const SOCKET_ADDRESS = 'ws://' + /https?:\/\/([^\/]*)\/.*/.exec(window.location.href)[1] + '/socket'
const SOCKET_GET_MSG = 'get';
const MSG_SEPARATOR = ';';
const MESSAGE_CYCLE = 100.0;

const CANVAS_SIZE = 400;
const HALF_CANVAS_SIZE = CANVAS_SIZE / 2;

const PLOT_COLOR = 'red';
const MARK_LENGTH = 10;

const AVERAGE_SAMPLE = 6;

const Y_DOMAIN_MARGIN_M_PER_S = 0.5;
const Y_MIN_DOMAIN_M_PER_S = 0.5;
const Y_AVAILABLE_SPACE = CANVAS_SIZE - 80;
const Y_AXIS_OFFSET = 20;
const Y_AXIS_MARK_COUNT = 10;
const Y_MARK_SPACE_LENGTH = Y_AVAILABLE_SPACE / Y_AXIS_MARK_COUNT;

const X_DOMAIN_MARGIN_S = 3.0;
const X_MIN_DOMAIN_S = 30.0;
const X_AVAILABLE_SPACE = CANVAS_SIZE - Y_AXIS_OFFSET - 50;
const X_AXIS_MARK_COUNT = 10;
const X_MARK_SPACE_LENGTH = X_AVAILABLE_SPACE / X_AXIS_MARK_COUNT;

const initCanvas = () => {
    const canvas = document.getElementById('graph-canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    if (!canvas.getContext) {
        alert('Canvas nie jest wspierany');
        return;
    }

    return canvas.getContext('2d');
};

const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.stroke();
};

const xToCanvas = (x, maxX) => {
    return (x / maxX) * X_AVAILABLE_SPACE + Y_AXIS_OFFSET;
}

const yToCanvas = (y, maxY) => {
    return HALF_CANVAS_SIZE - (y / maxY) * Y_AVAILABLE_SPACE;
};

const drawPlot = (ctx, xs, ys, maxX, maxY) => {
    const oldStyle = ctx.strokeStyle;
    ctx.strokeStyle = PLOT_COLOR;

    for (let i = 1; i < xs.length; ++i) {
        drawLine(ctx,
            xToCanvas(xs[i - 1], maxX),
            yToCanvas(ys[i - 1], maxY),
            xToCanvas(xs[i], maxX),
            yToCanvas(ys[i], maxY)
        );
    }

    ctx.strokeStyle = oldStyle;
};

const drawXMarks = (ctx, maxX) => {
    const xMarkStep = maxX / X_AXIS_MARK_COUNT;
    for (let i = 0; i < X_AXIS_MARK_COUNT; ++i) {
        const x = Y_AXIS_OFFSET + (i + 1) * X_MARK_SPACE_LENGTH;
        drawLine(ctx, x, HALF_CANVAS_SIZE - MARK_LENGTH / 2, x, HALF_CANVAS_SIZE + MARK_LENGTH / 2);
        ctx.strokeText(
            ((i + 1) * xMarkStep).toFixed(1),
            x - 10,
            HALF_CANVAS_SIZE + MARK_LENGTH / 2 + 10
        );
    }
};

const drawYMarksWithDir = (ctx, dir, maxY) => {
    const yMarkStep = maxY / Y_AXIS_MARK_COUNT;
    for (let i = 0; i < Y_AXIS_MARK_COUNT / 2; ++i) {
        const y = HALF_CANVAS_SIZE - dir * (i + 1) * Y_MARK_SPACE_LENGTH;
        drawLine(ctx, Y_AXIS_OFFSET - MARK_LENGTH / 2, y, Y_AXIS_OFFSET + MARK_LENGTH / 2, y);
        ctx.strokeText(
            (dir * (i + 1) * yMarkStep).toFixed(1),
            Y_AXIS_OFFSET + MARK_LENGTH / 2 + 5, y + 2.5
        );
    }
};

const drawYMarks = (ctx, maxY) => {
    drawYMarksWithDir(ctx, 1, maxY);
    drawYMarksWithDir(ctx, -1, maxY);
};

const drawAxes = (ctx, maxX, maxY) => {
    drawLine(ctx, 0, HALF_CANVAS_SIZE, CANVAS_SIZE, HALF_CANVAS_SIZE); // X
    drawLine(ctx, Y_AXIS_OFFSET, 0, Y_AXIS_OFFSET, CANVAS_SIZE); // Y

    ctx.strokeText('t [s]', CANVAS_SIZE - 25, HALF_CANVAS_SIZE + 15);
    ctx.strokeText('v [m/s]', Y_AXIS_OFFSET + 5, 15);

    drawXMarks(ctx, maxX);
    drawYMarks(ctx, maxY);
};

const drawGraph = (ctx, xs, ys, maxX, maxY) => {
    drawPlot(ctx, xs, ys, maxX, maxY);
    drawAxes(ctx, maxX, maxY);
};

const clearCanvas = ctx => {
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
};

const redrawGraph = (ctx, data) => {
    clearCanvas(ctx);

    const time_start_ns = data[0][1];
    const xs = data.map((d => (d[1] - time_start_ns) / 1e9));
    let x_domain_s = xs[xs.length - 1] + X_DOMAIN_MARGIN_S;
    if (x_domain_s < X_MIN_DOMAIN_S) {
        x_domain_s = X_MIN_DOMAIN_S;
    }

    const ys = data.map(d => d[0]);
    const y_min = Math.min(...ys);
    let y_domain_m_per_s = (Math.max(-y_min, ...ys) + Y_DOMAIN_MARGIN_M_PER_S) * 2;
    if (y_domain_m_per_s < Y_MIN_DOMAIN_M_PER_S) {
        y_domain_m_per_s = Y_MIN_DOMAIN_M_PER_S;
    }

    drawGraph(ctx, xs, ys, x_domain_s, y_domain_m_per_s);
}

const parseMsg = msg => {
    const [distStr, timeStr] = msg.split(MSG_SEPARATOR);
    return [parseFloat(distStr), parseInt(timeStr)];
};

let dataInterval = null;
let lastData = null;

const openSocket = (ctx, data) => {
    const socket = new WebSocket(SOCKET_ADDRESS);
    socket.onmessage = msg => {
        if (dataInterval === null) {
            return;
        }

        const newData = parseMsg(msg.data);

        if (lastData !== null) {
            const newSpeed = (newData[0] - lastData[0]) / ((newData[1] - lastData[1]) / 1e9);
            data.push([newSpeed, newData[1]]);
            const drawData = [];

            let sum = 0;
            let sumt = 0;
            for (let i = 0; i < data.length; ++i) {
                sum += data[i][0];
                sumt += data[i][1];
                if (i + 1 >= AVERAGE_SAMPLE) {
                    drawData.push([sum / AVERAGE_SAMPLE, sumt / AVERAGE_SAMPLE]);
                    sum -= data[i - AVERAGE_SAMPLE + 1][0];
                    sumt -= data[i - AVERAGE_SAMPLE + 1][1];
                }
            }

            if(drawData.length > 0) {
                redrawGraph(ctx, drawData)
            }
        }

        lastData = newData;
    };

    return socket;
};

const getNewData = socket => {
    socket.send(SOCKET_GET_MSG)
};

const initButtons = (socket, data) => {
    const button = document.getElementById(MAIN_BUTTON_ID);
    button.onclick = () => {
        if (dataInterval === null) {
            button.innerHTML = 'Stop';
            dataInterval = setInterval(() => getNewData(socket), MESSAGE_CYCLE);
        }
        else {
            button.innerHTML = 'Start';
            data.length = 0;
            clearInterval(dataInterval);
            dataInterval = null;
        }
    };
};

const main = () => {
    const ctx = initCanvas();
    drawGraph(ctx, [], [], X_MIN_DOMAIN_S, Y_MIN_DOMAIN_M_PER_S);

    const data = [];
    const socket = openSocket(ctx, data);

    initButtons(socket, data);
};

main();
