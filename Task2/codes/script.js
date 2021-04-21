$(document).on("pageinit", "#demo-page", function () {
    $(document).on("swipeleft swiperight", "#demo-page", function (e) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ($.mobile.activePage.jqmData("panel") !== "open") {
            if (e.type === "swipeleft") {
                $("#right-panel").panel("open");
            } else if (e.type === "swiperight") {
                $("#left-panel").panel("open");
            }
        }
    });
});


// CANVAS FUNCTIONALITY
//  Creating a Canvas and assigning its WIDTH AND HEIGHT

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        selection: false,
        width: 1000,
        height: 1000
    });
}

const canvas = initCanvas('canvas');
const reader = new FileReader();



//  CREATING GRID FOR A CANVAS
const grid = 10;
for (var i = 0; i < 1000; i++) {
    const vlines = new fabric.Line([i * grid, 0, i * grid, 100000], {
        stroke: '#eee',
        selectable: false
    })
    canvas.add(vlines);
}
for (var i = 0; i < 1000; i++) {
    const hlines = new fabric.Line([0, i * grid, 100000, i * grid], {
        stroke: '#ccc',
        selectable: false
    })
    canvas.add(hlines);
}


//snapping on Grid

canvas.on('object:moving', function (options) {
    options.target.set({
        left: Math.round(options.target.left / grid) * grid,
        top: Math.round(options.target.top / grid) * grid
    });
});

//Restricting the Rotation Angles

var angles = [0, 90, 180, 270, 360];
canvas.on("object:rotating", function (rotEvtData) {
    var targetObj = rotEvtData.target;
    var angle = targetObj.angle % 360;
    for (var i = 0; i < angles.length; i++) {
        if (angle <= angles[i]) {
            targetObj.angle = angles[i];
            break;
        }
    }
});

//  Canvas Toggle Mode

const toggleMode = (mode) => {
    if (mode === modes.pan) {
        if (currentMode === 'pan') {
            currentMode = '';
        } else {
            currentMode = modes.pan;
            canvas.isDrawingMode = false;
            canvas.requestRenderAll();
        }
    }
    else if (mode === modes.drawing) {
        if (currentMode == 'drawing') {
            currentMode = '';
            canvas.isDrawingMode = false;
            canvas.requestRenderAll();
        } else {
            currentMode = mode.drawing;
            canvas.isDrawingMode = true;
            canvas.requestRenderAll();
        }
    }
}



// add objects

const setPanEvents = (canvas) => {
    console.log('paan');

    canvas.on('mouse:move', (event) => {
        if (mousePressed && currentMode === modes.pan) {
            canvas.setCursor('grab');
            canvas.renderAll();
            const nEvent = event.e;
            const delta = new fabric.Point(nEvent.movementX, nEvent.movementY);
            canvas.relativePan(delta);
        } else if (mousePressed && currentMode === modes.drawing) {
            canvas.isDrawingMode = true;
            canvas.renderAll();
        }
    })

    canvas.on('mouse:down', (event) => {
        mousePressed = true;
        if (currentMode === modes.pan) {
            canvas.setCursor('grab');
            canvas.renderAll();
        }
    });
    canvas.on('mouse:up', (event) => {
        mousePressed = false;
        canvas.setCursor('default');
        canvas.renderAll();
    });

}



let color = '#000000';

const setColorListener = () => {
    // console.log(color + "  1");
    const picker = document.getElementById('colorPicker');
    picker.addEventListener('change', (event) => {
        color = event.target.value;
        canvas.freeDrawingBrush.color = color;
        canvas.renderAll();
        // console.log(color + "   2");
    })
}


let mousePressed = false;
let currentMode;

const createRect = (canvas) => {
    console.log("rect");
    const rect = new fabric.Rect({
        width: grid * 3,
        height: grid * 3,
        fill: 'rgb(252, 219, 3)',
        originX: 'center',
        originY: 'center',
        left: 150,
        top: 150,
        cornerColor: 'black'
    });
    canvas.add(rect);
    canvas.renderAll();
    // rect.animate('top', canvas.height / 2, {
    //     onChange: canvas.renderAll.bind(canvas)
    // });
    rect.on('selected', () => {
        rect.set('fill', 'rgb(255, 247, 28)');
        canvas.renderAll();
        console.log('select rect');
    })
    rect.on('deselected', () => {
        rect.set('fill', 'rgb(252, 219, 3)');
        canvas.renderAll();
        console.log('deselect rect');
    })
}

const createCirc = (canvas) => {
    console.log("circle");
    const circle = new fabric.Circle({
        radius: 2 * grid,
        fill: 'red',
        left: 150,
        top: 150,
        originX: 'center',
        originY: 'center',
        cornerColor: 'black'
    });
    canvas.add(circle);
    canvas.renderAll();
    // circle.animate('left', canvas.width - 30, {
    //     onChange: canvas.renderAll.bind(canvas),
    //     onComplete: () => {
    //         circle.animate('left', canvas.width / 2, {
    //             onChange: canvas.renderAll.bind(canvas),
    //         })
    //     }
    // });
    circle.on('selected', () => {
        circle.set('fill', 'pink');
        canvas.renderAll();
        console.log('select circle');
    })
    circle.on('deselected', () => {
        circle.set('fill', 'red');
        canvas.renderAll();
        console.log('deselect rect');
    })
}

const groupObjects = (canvas, group, shouldGroup) => {
    if (shouldGroup) {
        const objects = canvas.getObjects();
        group.val = new fabric.Group(objects, {
            cornerColor: 'black'
        });
        clearCanvas(canvas, true);
        canvas.add(group.val);
        canvas.requestRenderAll();
    } else {
        group.val.destroy();
        const oldGroup = group.val.getObjects();
        canvas.remove(group.val);
        canvas.add(...oldGroup);
        group.val = null;
        canvas.requestRenderAll();
    }
}

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG();
    canvas.getObjects().forEach((o) => {
        if (o !== canvas.backgroundImage) {
            canvas.remove(o);
        }
    });
}

const restoreCanvas = (canvas, state, backURL) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log(objects);
            objects = objects.filter(o => o["xlink:href"] !== backURL)
            canvas.add(...objects);
            canvas.requestRenderAll();
        })
    }
}

const group = {};
const svgState = {};


const modes = {
    pan: 'pan',
    drawing: 'drawing'
}

setPanEvents(canvas);



setColorListener();

const addImg = (e) => {
    console.log(e);
    const inputEle = document.getElementById('myImg');
    const file = inputEle.files[0];

    reader.readAsDataURL(file);
}


const inputFile = document.getElementById('myImg');
inputFile.addEventListener('change', addImg);
reader.addEventListener('load', () => {
    console.log(reader.result);
    fabric.Image.fromURL(reader.result, img => {
        canvas.add(img);
        canvas.requestRenderAll();
    })
})


canvas.on('touch:wheel', function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
});

//  Zoom IN and Zoom Out Button Functionality

$('#zoomIn').click(function () {
    canvas.setZoom(canvas.getZoom() * 1.1);
});

$('#zoomOut').click(function () {
    canvas.setZoom(canvas.getZoom() / 1.1);
});

$('#zoomDef').click(function () {
    canvas.setZoom(1);
});

// Script Logic for option Slider

var slider = document.querySelector('.slider');
var slides = document.querySelectorAll('.slider-slide');
var active = 0;
var lastActive = 0;
var controller = new Hammer(slider);
var direction = 1;

var deltaX = 0;
var deltaY = 0;

controller.on('swipe', function (e) {
    deltaX = deltaX + e.deltaX;
    var _direction = e.offsetDirection;
    direction = _direction === 2 ? -1 : 1;
    if (_direction === 2) {
        nextSlide();
    }
    if (_direction === 4) {
        prevSlide();
    }
});

const goToSlide = (prev, current) => {
    const vel = 0.5;
    const delay = vel * 0.5;
    TweenMax.fromTo(prev, vel, {
        opacity: 1,
        x: '0%',
    }, {
        opacity: 0,
        x: `${100 * direction}%`,
        ease: Power2.easeOut
    });
    TweenMax.fromTo(current, vel, {
        opacity: 0,
        x: `${100 * direction * -1}%`,
    }, {
        opacity: 1,
        x: '0%',
        ease: Power2.easeOut,
        delay
    });
}

const prevSlide = () => {
    lastActive = active;
    if (active > 0) {
        active--;
    } else {
        active = slides.length - 1;
    }
    goToSlide(slides[lastActive], slides[active]);
}

const nextSlide = () => {
    lastActive = active;
    if (active < slides.length - 1) {
        active++;
    } else {
        active = 0;
    }
    goToSlide(slides[lastActive], slides[active]);
}

//  script for help section



var minimisedPlayer = document.getElementById('minimised');
var expandedPlayer = document.getElementById('expanded');



var mcMinimised = new Hammer(minimisedPlayer);
var mcExpanded = new Hammer.Manager(expandedPlayer);

var EXPANDED_PLAYER_HEIGHT = 360;
var DISPLAY_EXPANDED_THRESHOLD = EXPANDED_PLAYER_HEIGHT / 2;

var lastPosY = 0;
var isDragging = false;

function getTranslate3d(setting = '') {
    var values = setting.split(/\w+\(|\);?/);

    if (!values[1] || !values[1].length) {
        return [];
    }

    return values[1].split(/,\s?/g).map(value => parseInt(value, 10));
}

function setTranslate3dPosY(posY) {
    return 'translate3d(0,' + posY + 'px, 0)';
}

function hideExpandedPlayer(elem) {
    elem.classList.add("hide");
    minimisedPlayer.classList.remove("hide");
}

function displayExpandedPlayer(elem = expandedPlayer) {
    elem.style.transform = 'translate3d(0, 0, 0)';
    elem.classList.remove("hide");
    minimisedPlayer.classList.add("hide");
}

function handleDrag(ev) {
    var direction = ev.offsetDirection;
    var directionDown = direction === 16;

    if (!directionDown) {
        return;
    }

    var elem = ev.target;

    // DRAG STARTED
    if (!isDragging) {
        isDragging = true;
        var currentPosY = getTranslate3d(elem.style.transform)[1];
        lastPosY = currentPosY ? currentPosY : 0;
    }

    var posY = ev.deltaY + lastPosY;
    elem.style.transform = setTranslate3dPosY(posY);

    // DRAG ENDED
    if (ev.isFinal) {
        isDragging = false;

        posY < DISPLAY_EXPANDED_THRESHOLD ?
            displayExpandedPlayer(elem) : hideExpandedPlayer(elem);
    }
}

mcMinimised.on('tap', () => {
    displayExpandedPlayer();
})

mcExpanded.add(new Hammer.Pan({
    direction: Hammer.DIRECTION_ALL,
    threshold: 100
}));
mcExpanded.on("pan", handleDrag);

