// Snake by Tom Dupisre
import "dom" as dom
import "math" as math


def document = dom.document

// Activate the canvas tab if it isn't already
def ts = document.getElementById("output-select")
for (0..(ts.options.length-1)) do { i ->
    if (ts.options.item(i).value == "canvas") then {
        ts.selectedIndex := i
        dom.window.outputswitch
    }
}

def canvas = dom.document.getElementById("standard-canvas")
def ctx = canvas.getContext("2d")

ctx.fillStyle := "white"
ctx.fillRect(0, 0, 500, 500)

def game = object {
    var live is readable, writable := true
    var score is readable, writable := 1
}

class point.ofX ( xp : Number) ofY ( yp : Number) {
    var x is readable, writable := xp
    var y is readable, writable := yp
}

var pointIni := point.ofX 250 ofY 250
var pointTwo := point.ofX 240 ofY 250

def snake = object {
    var size := 3
    var elements is readable := []
    elements.push(pointIni)
    elements.push(pointTwo)

    method movement {
        if ((direction.keyCode == 38) && (elements[1].y == 0)) then {
            elements[1].y := 490
        } elseif {(direction.keyCode == 37) && (elements[1].x == 0)} then {
            elements[1].x := 490
        } elseif {(direction.keyCode == 40) && (elements[1].y == 490)} then {
            elements[1].y := 0
        } elseif {(direction.keyCode == 39) && (elements[1].x == 490)} then {
            elements[1].x := 0
        } else {
            elements[1].x := elements[1].x + direction.dx
            elements[1].y := elements[1].y + direction.dy
            // In case we eat our tail
            for (2..elements.size) do { i ->
                if ((elements[1].x == elements[i].x) && (elements[1].y == elements[i].y)) then {
                    game.live := false
                }
            }
            // In case we catch an apple
            if ((elements[1].x == apple.x) && (elements[1].y == apple.y)) then {
                 apple.appears
                 var newPoint := point.ofX (elements[elements.size].x + direction.dx) ofY (elements[elements.size].y + direction.dy)
                 elements.push(newPoint)
                 game.score := game.score + 1
            }
        }
        for (2..elements.size) do { i ->
            elements[elements.size+2-i].x := elements[elements.size+1-i].x
            elements[elements.size+2-i].y := elements[elements.size+1-i].y
        }
    }

    method draw {
        ctx.fillStyle := "black"
        for (1..elements.size) do { i ->
            ctx.fillRect(elements[i].x, elements[i].y , 10, 10)
        }
    }
}

def apple = object {
    var x is readable, writable
    var y is readable, writable

    method appears {
        x := math.random * 50
        x := x - (x % 1)
        x := x * 10
        print("x is now {x}")

        y := math.random * 50
        y := y - (y % 1)
        y := y * 10
        print("y is now {y}")
    }

    method draw {
        ctx.fillStyle := "red"
        ctx.fillRect(x, y , 10, 10)
    }
}

def direction = object {
    var keyCode is readable, writable := 40
    var keyCodeTemp is readable, writable := 40

    var dx is readable := -10
    var dy is readable := 0

    method updateKeyCode {
        if (((keyCodeTemp - keyCode) != -2) && ((keyCodeTemp - keyCode) != 2))
            then {
                keyCode := keyCodeTemp
            }
    }

    method updateMove {

        updateKeyCode

        if (keyCode == 38) then {
            dx :=  0
            dy := -10
        } elseif {keyCode == 37} then {
            dx :=  -10
            dy := 0
        } elseif {keyCode == 40} then {
            dx :=  0
            dy := 10
        } elseif {keyCode == 39} then {
            dx :=  10
            dy := 0
        }
    }
}



def keyboardListener = { ev -> direction.keyCodeTemp := ev.keyCode }
document.addEventListener("keydown", keyboardListener, true)



// We initialize the apple :
apple.appears

dom.while {game.live} waiting 42 do {

    direction.updateMove
    snake.movement

    ctx.fillStyle := "white"
    ctx.fillRect(0, 0, 500, 500)
    snake.draw
    apple.draw
}.then { // When the while loop terminates, run this block.
    ctx.font := "50px sans-serif"
    ctx.textAlign := "center"
    ctx.textBaseline := "middle"
    ctx.fillText("Score : {game.score}", 250, 125)
    }
