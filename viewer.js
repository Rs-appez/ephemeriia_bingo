var token, userId;

const backend = "http://127.0.0.1:8000";

var bingoBoard = [];

// so we don't have to write this out everytime #efficency
const twitch = window.Twitch.ext;


// callback called when context of an extension is fired 
twitch.onContext((context) => {
  // console.log(context);
  console.log("Context fired");
  console.log("Test refresh");

});


// onAuthorized callback called each time JWT is fired
twitch.onAuthorized((auth) => {
  // save our credentials
  token = auth.token; //JWT passed to backend for authentication 
  userId = auth.userId; //opaque userID 

  getBingoBoard().then(() => {
    makeBingoBoard();
  });

});

function getBingoBoard(){
  return fetch(backend+"/bingo/api/bingo/get_bingo/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({token: token}),
  })
  .then(response => response.json())
  .then(data => {
    bingoBoard = data["bingo_items"];
  })
  .catch((error) => {
    console.error('Error:', error);
    });
}

function makeBingoBoard(){
  var board = document.getElementById("bingo-board");
  board.innerHTML = "";
  length = Math.sqrt(bingoBoard.length);
  board.style.gridTemplateColumns = "repeat("+length+", 1fr)";

  for (var i = 0; i < bingoBoard.length; i++){
    item = bingoBoard[i];
    var cell = document.createElement("div");
    if (item['is_checked']){
      cell.className = "bingo-cell bingo-cell-checked";
    }
    else{
    cell.className = "bingo-cell";
    }
    cell.innerHTML = item['bingo_item']['name'];
    board.appendChild(cell);
  }
}