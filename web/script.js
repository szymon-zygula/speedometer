const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
};

const main = () => {
    const canvas = document.getElementById("graph-canvas");

    if (!canvas.getContext) {
        alert("Canvas nie jest wspierany");
        return;
    }

    const ctx = canvas.getContext("2d");
    drawLine(ctx, 0, 0, 20, 100);
};
