let token, userId;

const backend = "http://127.0.0.1:8000";

let bingoBoard = [];

// so we don't have to write this out everytime #efficency
const twitch = window.Twitch.ext;

// callback called when context of an extension is fired
//twitch.onContext((context) => { });

// onAuthorized callback called each time JWT is fired
twitch.onAuthorized((auth) => {
    // save our credentials
    token = auth.token; //JWT passed to backend for authentication
    userId = auth.userId; //opaque userID

    if (!twitch.viewer.isLinked && twitch.viewer.isLinked !== null) {
        permission = document.getElementById("permission");
        permission.style.display = "block";
        twitch.actions.requestIdShare();
    } else if (twitch.viewer.isLinked) {
        resetBingoBoard();
    }
});

function doneLoading() {
    loader = document.getElementById("loading");
    loader.style.display = "none";

    bingo = document.getElementById("bingo");
    bingo.removeAttribute("hidden");
}

function loading() {
    loader = document.getElementById("loading");
    loader.style.display = "block";

    bingo = document.getElementById("bingo");
    bingo.setAttribute("hidden", true);

    error = document.getElementById("error");
    error.style.display = "none";
}

function errorPage() {
    loader = document.getElementById("loading");
    loader.style.display = "none";

    error = document.getElementById("error");
    error.style.display = "block";
}

function refresh() {
    loading();
    resetBingoBoard();
}

function resetBingoBoard() {
    getBingoBoard().then(() => {
        makeBingoBoard();
    });
}

async function getBingoBoard() {
    try {
        const response = await fetch(backend + "/bingo/api/bingo/get_bingo/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: token }),
        });
        const data = await response.json();
        bingoBoard = data["bingo_items"];

        if (response.status !== 200) {
            errorPage();
        }
    } catch (error) {
        errorPage();
        console.error("Error:", error);
    }
}

function makeBingoBoard() {
    let board = document.getElementById("bingo-board");
    board.innerHTML = "";
    length = Math.sqrt(bingoBoard.length);
    //board.style.gridTemplateColumns = "repeat("+length+", 1fr)";

    for (let i = 0; i < bingoBoard.length; i++) {
        item = bingoBoard[i];
        let cell = document.createElement("div");
        if (item["is_checked"]) {
            cell.className = "bingo-cell bingo-cell-checked";
        } else {
            cell.className = "bingo-cell";
        }
        cell.innerHTML = item["bingo_item"]["name"];
        cell.addEventListener("click", clickCell);

        board.appendChild(cell);
    }
    console.log("bingo : ", bingoBoard);
    if (bingoBoard.length === 0) {
        errorPage();
    } else {
        doneLoading();
    }
}

function clickCell() {
    let cell = this;
    cell.classList.add("bingo-cell-waiting");
    let cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    let item = bingoBoard[cellIndex];
    fetch(backend + "/bingo/api/bingo_item_user/check_item/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: token,
            bingo_item: item["bingo_item"]["name"],
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            bingoBoard = data["bingo_items"];
            makeBingoBoard();
        })
        .catch((error) => {
            errorPage();
            console.error("Error:", error);
        });
}
