const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        selection: false,
        width: 700,
        height: 500
    });
}
const canvas = initCanvas('c');
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

var btnstate = false;

$('wire').click(function () {



    var circle, line;
    var isDown = false;
    var isOver = false;
    var lines = [];
    var circles = [];
    var id = 1;
    var x2 = 0;
    var y2 = 0;
    var circleIndex;
    var startDraw = false;


    canvas.on('mouse:down', function (options) {

        isDown = true;
        var pointer = canvas.getPointer(options.e);

        if (isOver) {
            var points = [x2, y2, x2, y2];
        } else if (!isOver) {
            var points = [pointer.x, pointer.y, pointer.x, pointer.y];
        }

        if (!isOver || !startDraw) {
            line = new fabric.Line(points, {
                strokeWidth: 3,
                fill: 'red',
                stroke: 'red',
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            circle = new fabric.Circle({
                left: line.x1,
                top: line.y1,
                strokeWidth: 1,
                opacity: 0.5,
                radius: 10,
                fill: 'transparent',
                stroke: '#666',
                perPixelTargetFind: true,
                selectable: false
            });
            circle.position = "left";
            circle.hasControls = circle.hasBorders = false;
            circles.push(circle);
            canvas.add(circle)
            lines.push(line);
            circle.lineId = lines.length - 1;
            canvas.add(line);
        } else {
            startDraw = false;
            if (circles[circleIndex].position === 'left') {
                var points = [lines[circles[circleIndex].lineId].x1,
                lines[circles[circleIndex].lineId].y1,
                lines[circles[circleIndex].lineId].x1,
                lines[circles[circleIndex].lineId].y1];
            }
            else {
                var points = [lines[circles[circleIndex].lineId].x2,
                lines[circles[circleIndex].lineId].y2,
                lines[circles[circleIndex].lineId].x2,
                lines[circles[circleIndex].lineId].y2];
            }

            line = new fabric.Line(points, {
                strokeWidth: 3,
                fill: 'red',
                stroke: 'red',
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            canvas.add(line);
            lines.push(line);
        }
    });

    canvas.on('mouse:move', function (options) {
        var pt = { x: options.e.clientX, y: options.e.clientY };

        for (i = 0; i < circles.length; i++) {
            if (circles[i].containsPoint(pt)) {
                if (!circles[i].mouseOver) {
                    circles[i].mouseOver = true;
                    circles[i].set('radius', 12);
                    circles[i].set('opacity', 1.0);
                    circles[i].set('selectable', false);
                    canvas.renderAll();
                    isOver = true;
                    circleIndex = i;
                    if (circles[i].position === 'left') {
                        x2 = lines[circles[i].lineId].x1;
                        y2 = lines[circles[i].lineId].y1;
                    } else {
                        x2 = lines[circles[i].lineId].x2;
                        y2 = lines[circles[i].lineId].y2;
                    }

                }
            } else if (circles[i].mouseOver) {
                circles[i].mouseOver = false;
                circles[i].set('opacity', 0.5);
                circles[i].set('radius', 10);
                circles[i].set('selectable', false);
                canvas.renderAll();
                isOver = false;
            }
        }


        if (!isDown) {
            startDraw = true;
            return;
        }
        startDraw = false;
        var pointer = canvas.getPointer(options.e);

        if (isOver) {
            line.set({ x2: x2, y2: y2 });
        } else {
            line.set({ x2: pointer.x, y2: pointer.y });
        }

        canvas.renderAll();
    });

    fabric.util.addListener(window, 'keyup', function (options) {
        if (options.keyCode === 13) {
            isDown = false;
            if (isOver) {
                circles[circleIndex].set('radius', 10);
                circles[circleIndex].set('opacity', 0.5);
                canvas.renderAll();
                line.set({ x2: x2, y2: y2 });
                isOver = false;
            } else {
                canvas.add(line);
                circle = new fabric.Circle({
                    left: lines[lines.length - 1].x2,
                    top: lines[lines.length - 1].y2,
                    strokeWidth: 1,
                    opacity: 0.5,
                    radius: 10,
                    fill: 'transparent',
                    stroke: '#666',
                    perPixelTargetFind: true,
                    selectable: false
                });
                circle.position = "right";
                circle.hasControls = circle.hasBorders = false;
                circle.lineId = lines.length - 1;
                circles.push(circle);
                canvas.add(circle);
                canvas.renderAll();
            }

        }


    });
});





fabric.Image.fromURL("https://circuitverse.org/img/SquareRGBLed.svg", (img) => {
    canvas.add(img);
});