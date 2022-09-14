let board = [];
let rows = 8;
let columns = 8;

let minesCount = 10;
let minesLocation = []; // "2-2", "3-4", "2-1" - make a set?

let tilesClicked = 0; //goal to click all tiles except the ones containing mines
let flagEnabled = false;

let gameOver = false;

let firstClick = true;

window.onload = function() {
   document.getElementById('start-btn').addEventListener('click',  (e)=> {
    e.preventDefault();
    let inputValue = document.getElementById('mine-input').value;
    if(inputValue >= 64) return window.location.reload();

    minesCount = inputValue;

    document.getElementById('start').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    startGame()
   }, {once: true}) // remove event listener
}

function setMines() {
    // minesLocation.push("2-2");
    // minesLocation.push("2-3");
    // minesLocation.push("5-6");
    // minesLocation.push("3-4");
    // minesLocation.push("1-1");

    let minesLeft = minesCount;
    while (minesLeft > 0) { 
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * columns);
        let id = r.toString() + "-" + c.toString();

        if (!minesLocation.includes(id)) {
            minesLocation.push(id);
            minesLeft -= 1;
        }
    }
}

function startGame() {
    document.getElementById("mines-count").innerText = minesCount;
    document.getElementById("flag-button").addEventListener("click", setFlag);
    setMines();

    //populate our board
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < columns; c++) {
            //<div id="0-0"></div>
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();
            tile.addEventListener("click", clickTile);
            document.getElementById("board").append(tile);
            row.push(tile);
        }
        board.push(row);
    }

    //console.log(board);
}

function setFlag(e) {
    if (flagEnabled) {
        flagEnabled = false;
        document.getElementById("flag-button").style.backgroundColor = "lightgray";
    } else {
        flagEnabled = true;
        document.getElementById("flag-button").style.backgroundColor = "darkgray";
    }
}

function clickTile() {
    let tile = this;
  
    if (gameOver || this.classList.contains("tile-clicked")) {
        return;
    }

    // check if it's first click on board and cell has a bomb
    // create a new bomb and add it to existing array of bombs
    // checkMine() around cell 
  
    // variables and code is same from other places - doesn't matter because it is different context
    // issues when there are many bombs
    // 63 bombs you will win automatically - limited it to 60 in html
    // added firstClick = false to the end of this function to prevent condition from being evaluated again

    if(firstClick && minesLocation.includes(tile.id)){
        firstClick = false;
 
        minesLocation = minesLocation.filter(mine => mine !== tile.id)

        let minesLeft = 1;
        while (minesLeft === 1) { 
            let r = Math.floor(Math.random() * rows);
            let c = Math.floor(Math.random() * columns);
            let id = r.toString() + "-" + c.toString();
    
            if (!minesLocation.includes(id)) {
                minesLocation.push(id);
                minesLeft -= 1;
            }
        }

        let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        checkMine(r, c);
        return;
    }

    /* 
    if (flagEnabled) {
        // allows flag to be toggled but you can still click on flag and hit a bomb

        if (tile.innerText == "") {
            tile.innerText = "🚩";
        } else if (tile.innerText == "🚩") {
            tile.innerText = "";
        }
        return;
    }
    */
    
    if (flagEnabled && tile.innerText === "") {
        // you cannot reposition a flag
        // if you place flag on div without a bomb - game over
        tile.innerText = "🚩";
        tile.removeEventListener('click', clickTile);
        return;    
    }

    if (minesLocation.includes(tile.id)) {
        // alert("GAME OVER");
        gameOver = true;
        revealMines();
        document.getElementById('play-again').style.display = 'inline-block';
        document.getElementById('play-again').addEventListener('click', ()=> {
            window.location.reload()
        })
        return;
    }

    let coords = tile.id.split("-"); // "0-0" -> ["0", "0"]
    let r = parseInt(coords[0]);
    let c = parseInt(coords[1]);
    checkMine(r, c);

    firstClick = false;
}

function revealMines() {
    for (let r= 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let tile = board[r][c];
            if (minesLocation.includes(tile.id)) {
                tile.innerText = "💣";
                tile.style.backgroundColor = "red";                
            }
        }
    }
}

function checkMine(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return;
    }
    if (board[r][c].classList.contains("tile-clicked") || board[r][c].classList.contains('flag')) {
        return;
    }

    board[r][c].classList.add("tile-clicked");
    tilesClicked += 1;

    let minesFound = 0;

    //top 3
    minesFound += checkTile(r-1, c-1);      //top left
    minesFound += checkTile(r-1, c);        //top 
    minesFound += checkTile(r-1, c+1);      //top right

    //left and right
    minesFound += checkTile(r, c-1);        //left
    minesFound += checkTile(r, c+1);        //right

    //bottom 3
    minesFound += checkTile(r+1, c-1);      //bottom left
    minesFound += checkTile(r+1, c);        //bottom 
    minesFound += checkTile(r+1, c+1);      //bottom right

    if (minesFound > 0) {
        board[r][c].innerText = minesFound;
        board[r][c].classList.add("x" + minesFound.toString());
    }
    else {
        //top 3
        checkMine(r-1, c-1);    //top left
        checkMine(r-1, c);      //top
        checkMine(r-1, c+1);    //top right

        //left and right
        checkMine(r, c-1);      //left
        checkMine(r, c+1);      //right

        //bottom 3
        checkMine(r+1, c-1);    //bottom left
        checkMine(r+1, c);      //bottom
        checkMine(r+1, c+1);    //bottom right
    }

    if (tilesClicked == rows * columns - minesCount) {
        document.getElementById("mines-count").innerText = "Cleared";
        gameOver = true;
        document.getElementById('play-again').style.display = 'inline-block';
        document.getElementById('play-again').addEventListener('click', ()=> {
            window.location.reload()
        }, {once: true})
    }

}

function checkTile(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= columns) {
        return 0;
    }
    if (minesLocation.includes(r.toString() + "-" + c.toString())) {
        return 1;
    }
    return 0;
}