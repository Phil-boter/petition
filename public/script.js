let isDrawing = false;
let x = 0;
let y = 0;

const drawSig = document.getElementById("canvas");
const ctx = drawSig.getContext("2d");

const rect = drawSig.getBoundingClientRect();

drawSig.addEventListener("mousedown", e => {
    x = e.clientX - rect.left;
    y = e.clientY - rect.top;
    isDrawing = true;
});

drawSig.addEventListener("mousemove", e => {
    if (isDrawing === true) {
        drawLine(ctx, x, y, e.clientX - rect.left, e.clientY - rect.top);
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
});

window.addEventListener("mouseup", e => {
    if (isDrawing === true) {
        drawLine(ctx, x, y, e.clientX - rect.left, e.clientY - rect.top);
        x = 0;
        y = 0;
        isDrawing = false;
    }
});

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

const button = $("button");

const signature = document.getElementById("signature");

button.on("click", function() {
    let canvasValue = drawSig.toDataURL();
    signature.value = canvasValue;
});