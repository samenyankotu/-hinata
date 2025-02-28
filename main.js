"use strict";

const BLACK = 1,
  WHITE = -1;
let data = [];
let turn = true;
const board = document.getElementById("board");
const h2 = document.querySelector("h2");
const counter = document.getElementById("counter");
const modal = document.getElementById("modal");
document.querySelectorAll(".select").forEach((value) => {
  value.addEventListener("click", start);
});
let cells = 8; // Default grid size
let gameStarted = false; // Flag to check if game has started

// スタート画面でマスの数が選択された時の処理
function start(e) {
  cells = Number(e.target.id);
  board.innerHTML = "";
  init();
  modal.classList.add("hide");
  gameStarted = true; // Set the flag to true after selecting grid size
}

// 初期化
function init() {
  for (let i = 0; i < cells; i++) {
    const tr = document.createElement("tr");
    data[i] = Array(cells).fill(0);
    for (let j = 0; j < cells; j++) {
      const td = document.createElement("td");
      const disk = document.createElement("div");
      tr.appendChild(td);
      td.appendChild(disk);
      td.className = "cell";
      td.onclick = clicked;
    }
    board.appendChild(tr);
  }

  // マスの数によって石の初期配置を変える
  switch (cells) {
    case 4:
      board.classList.add("cell-4");
      putDisc(1, 1, WHITE);
      putDisc(2, 2, WHITE);
      putDisc(1, 2, BLACK);
      putDisc(2, 1, BLACK);
      break;
    case 6:
      board.classList.add("cell-6");
      putDisc(2, 2, WHITE);
      putDisc(3, 3, WHITE);
      putDisc(2, 3, BLACK);
      putDisc(3, 2, BLACK);
      break;
    case 8:
      putDisc(3, 3, WHITE);
      putDisc(4, 4, WHITE);
      putDisc(3, 4, BLACK);
      putDisc(4, 3, BLACK);
  }
  showTurn();
}

init();

// 石を描画
function putDisc(x, y, color) {
  board.rows[y].cells[x].firstChild.className =
    color === BLACK ? "black" : "white";
  board.rows[y].cells[x].animate(
    { opacity: [0.4, 1] },
    { duration: 700, fill: "forwards" }
  );
  data[y][x] = color;
}

// 手番などの表示
function showTurn() {
  h2.textContent = turn ? "あなたの番です" : "日向の番です";
  let numWhite = 0,
    numBlack = 0,
    numEmpty = 0;
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      if (data[x][y] === WHITE) {
        numWhite++;
      }
      if (data[x][y] === BLACK) {
        numBlack++;
      }
      if (data[x][y] === 0) {
        numEmpty++;
      }
    }
  }
  document.getElementById("numBlack").textContent = numBlack;
  document.getElementById("numWhite").textContent = numWhite;

  let blacDisk = checkReverse(BLACK);
  let whiteDisk = checkReverse(WHITE);

  if (numWhite + numBlack === cells * cells || (!blacDisk && !whiteDisk)) {
    if (numBlack > numWhite) {
      document.getElementById("numBlack").textContent = numBlack + numEmpty;
      h2.textContent = "あなたの勝ち!!";
      restartBtn();
      showAnime();
    } else if (numBlack < numWhite) {
      document.getElementById("numWhite").textContent = numWhite + numEmpty;
      h2.textContent = "日向の勝ち!!";
      restartBtn();
      showAnime();
    } else {
      h2.textContent = "引き分け";
      restartBtn();
      showAnime();
    }
    clearHighlights();  // ゲーム終了時にハイライトを消去
    return;
  }

  // 黒のターン
  if (turn && !blacDisk) {
    h2.textContent = "あなたはスキップ";
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;
  }

  // 白のターン
  if (!turn && !whiteDisk) {
    h2.textContent = "日向はスキップ";
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;
  }

  // プレイヤーのターンのときだけハイライト
  if (gameStarted && turn) {
    highlightValidMoves(turn ? BLACK : WHITE);
  }

  // プレイヤーが手を置いた後にハイライトを消去
  if (!turn) {
    clearHighlights();
  }

  // プレイヤーが置いてから1秒後にAIターンを開始
  if (!turn) {
    setTimeout(aiTurn, 1000); // AIが置くまで1秒待つ
  }
}

// AIのターンを処理
function aiTurn() {
  const availableMoves = [];
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      if (data[y][x] === 0 && checkPut(x, y, WHITE).length > 0) {
        availableMoves.push([x, y]);
      }
    }
  }

  if (availableMoves.length > 0) {
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    const [x, y] = randomMove;
    const result = checkPut(x, y, WHITE);
    result.forEach((value) => {
      putDisc(value[0], value[1], WHITE);
    });
  } else {
    // AIが置けない場合もスキップし、ゲームを終了させる処理
    h2.textContent = "AIスキップ";
    turn = !turn;
    setTimeout(showTurn, 2000);
    return;  // AIターンをスキップして次のターンへ
  }

  turn = !turn;  // AIの後、プレイヤーのターンに戻る
  highlightValidMoves(BLACK);  // プレイヤーが置ける場所をハイライト
  showTurn();  // 次のターンに進む
}

// プレイヤーが置ける場所をハイライト
function highlightValidMoves(color) {
  clearHighlights();

  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      const result = checkPut(x, y, color);
      if (result.length > 0) {
        board.rows[y].cells[x].classList.add("highlight");
      }
    }
  }
}

// 盤面上のハイライトを消去
function clearHighlights() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => cell.classList.remove("highlight"));
}

// マスがクリックされた時の処理
function clicked() {
  if (!turn) return; // AIのターン中はクリックできない

  const color = turn ? BLACK : WHITE;
  const y = this.parentNode.rowIndex;
  const x = this.cellIndex;
  // マスに置けるかチェック
  if (data[y][x] !== 0) {
    return;
  }
  const result = checkPut(x, y, color);
  if (result.length > 0) {
    result.forEach((value) => {
      putDisc(value[0], value[1], color);
    });
    turn = !turn;
  }
  showTurn();
}

// 置いたマスの周囲8方向をチェック
function checkPut(x, y, color) {
  let dx, dy;
  const opponentColor = color == BLACK ? WHITE : BLACK;
  let tmpReverseDisk = [];
  let reverseDisk = [];
  const direction = [
    [-1, 0], // 左
    [-1, 1], // 左下
    [0, 1], // 下
    [1, 1], // 右下
    [1, 0], // 右
    [1, -1], // 右上
    [0, -1], // 上
    [-1, -1], // 左上
  ];

  if (data[y][x] === BLACK || data[y][x] === WHITE) {
    return [];
  }
  for (let i = 0; i < direction.length; i++) {
    dx = direction[i][0] + x;
    dy = direction[i][1] + y;
    if (
      dx >= 0 &&
      dy >= 0 &&
      dx <= cells - 1 &&
      dy <= cells - 1 &&
      opponentColor === data[dy][dx]
    ) {
      tmpReverseDisk.push([x, y]);
      tmpReverseDisk.push([dx, dy]);
      while (true) {
        dx += direction[i][0];
        dy += direction[i][1];
        if (
          dx < 0 ||
          dy < 0 ||
          dx > cells - 1 ||
          dy > cells - 1 ||
          data[dy][dx] === 0
        ) {
          tmpReverseDisk = [];
          break;
        }
        if (opponentColor === data[dy][dx]) {
          tmpReverseDisk.push([dx, dy]);
        }
        if (color === data[dy][dx]) {
          reverseDisk = reverseDisk.concat(tmpReverseDisk);
          tmpReverseDisk = [];
          break;
        }
      }
    }
  }
  return reverseDisk;
}

// 裏返せる場所があるか確認
function checkReverse(color) {
  for (let x = 0; x < cells; x++) {
    for (let y = 0; y < cells; y++) {
      const result = checkPut(x, y, color);
      if (result.length > 0) {
        return true;
      }
    }
  }
  return false;
}

// ゲーム終了画面
function restartBtn() {
  const restartBtn = document.getElementById("restartBtn");
  restartBtn.classList.remove("hide");
  restartBtn.animate(
    { opacity: [1, 0.5, 1] },
    { delay: 2000, duration: 3000, iterations: "Infinity" }
  );

  restartBtn.addEventListener("click", () => {
    document.location.reload();
  });
}

function showAnime() {
  h2.animate({ opacity: [0, 1] }, { duration: 500, iterations: 4 });
}
