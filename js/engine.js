const CHESSBOARD_ID = 'chessboard';
const PIECES = {
    'P': { type: 'Pawn', color: 'w', value: 100, symbol: '&#9817;' },
    'N': { type: 'Knight', color: 'w', value: 320, symbol: '&#9816;' },
    'B': { type: 'Bishop', color: 'w', value: 330, symbol: '&#9815;' },
    'R': { type: 'Rook', color: 'w', value: 500, symbol: '&#9814;' },
    'Q': { type: 'Queen', color: 'w', value: 900, symbol: '&#9813;' },
    'K': { type: 'King', color: 'w', value: 20000, symbol: '&#9812;' },
    'p': { type: 'Pawn', color: 'b', value: -100, symbol: '&#9823;' },
    'n': { type: 'Knight', color: 'b', value: -320, symbol: '&#9822;' },
    'b': { type: 'Bishop', color: 'b', value: -330, symbol: '&#9821;' },
    'r': { type: 'Rook', color: 'b', value: -500, symbol: '&#9820;' },
    'q': { type: 'Queen', color: 'b', value: -900, symbol: '&#9819;' },
    'k': { type: 'King', color: 'b', value: -20000, symbol: '&#9818;' },
    '':  { type: 'Empty', color: '', value: 0, symbol: '' }
};
const INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";

let board = null;
let currentPlayer = 'w';
let selectedSquare = null;
let legalMoves = [];
let isEngineThinking = false;

class Board {
    constructor(fen) {
        this.pieces = new Array(64).fill('');
        this.parseFEN(fen);
    }
    parseFEN(fen) {
        const boardString = fen.split(' ')[0];
        let file = 0;
        let rank = 0;
        for (let char of boardString) {
            if (char === '/') {
                rank++;
                file = 0;
            } else if (/\d/.test(char)) {
                file += parseInt(char, 10);
            } else {
                const index = rank * 8 + file;
                this.pieces[index] = char;
                file++;
            }
        }
    }
    getPiece(index) { return this.pieces[index]; }
    clone() {
        const newBoard = new Board(INITIAL_FEN);
        newBoard.pieces = [...this.pieces];
        return newBoard;
    }
    makeMove(from, to) {
        const piece = this.getPiece(from);
        this.pieces[to] = piece;
        this.pieces[from] = '';
        if ((piece === 'P' && Math.floor(to / 8) === 0) || (piece === 'p' && Math.floor(to / 8) === 7)) {
            this.pieces[to] = (piece === 'P' ? 'Q' : 'q');
        }
    }
    static indexToAlgebraic(index) {
        const file = String.fromCharCode('a'.charCodeAt(0) + (index % 8));
        const rank = 8 - Math.floor(index / 8);
        return `${file}${rank}`;
    }
}

class Engine {
    constructor() { this.maxDepth = 2; }
    setDepth(depth) { this.maxDepth = depth; }

    generateMoves(currentBoard, color) {
        const moves = [];
        for (let from = 0; from < 64; from++) {
            const pieceChar = currentBoard.getPiece(from);
            if (pieceChar && PIECES[pieceChar].color === color) {
                this._getPieceMoves(currentBoard, from, pieceChar, moves);
            }
        }
        return moves;
    }

    _isOpponent(pieceChar, color) { return pieceChar !== '' && PIECES[pieceChar].color !== color; }
    _isValidSquare(index) { return index >= 0 && index < 64; }

    _getPieceMoves(currentBoard, from, pieceChar, moves) {
        const pieceInfo = PIECES[pieceChar];
        const color = pieceInfo.color;
        const isWhite = color === 'w';
        const rank = Math.floor(from / 8);
        const file = from % 8;
        
        if (pieceInfo.type === 'Pawn') {
            const dir = isWhite ? -1 : 1;
            const oneStep = from + dir * 8;
            const twoStep = from + dir * 16;
            const startRank = isWhite ? 6 : 1;
            if (this._isValidSquare(oneStep) && currentBoard.getPiece(oneStep) === '') {
                moves.push({ from, to: oneStep });
                if (rank === startRank && currentBoard.getPiece(twoStep) === '') {
                    moves.push({ from, to: twoStep });
                }
            }
            const captureOffsets = isWhite ? [-9, -7] : [7, 9];
            for (const offset of captureOffsets) {
                const target = from + offset;
                if (this._isValidSquare(target) && this._isOpponent(currentBoard.getPiece(target), color)) {
                     if (Math.abs(target % 8 - file) === 1) { 
                        moves.push({ from, to: target });
                     }
                }
            }
            return;
        }

        if (pieceInfo.type === 'Knight') {
            const offsets = [-17, -15, -10, -6, 6, 10, 15, 17];
            for (const offset of offsets) {
                const to = from + offset;
                if (this._isValidSquare(to)) {
                    const targetFile = to % 8;
                    if (Math.abs(targetFile - file) <= 2) {
                        const targetPiece = currentBoard.getPiece(to);
                        if (targetPiece === '' || this._isOpponent(targetPiece, color)) {
                            moves.push({ from, to });
                        }
                    }
                }
            }
            return;
        }
        
        let directions = [];
        if (pieceInfo.type === 'Rook' || pieceInfo.type === 'Queen') { directions.push(-8, 8, -1, 1); }
        if (pieceInfo.type === 'Bishop' || pieceInfo.type === 'Queen') { directions.push(-9, 9, -7, 7); }
        if (pieceInfo.type === 'King') { directions.push(-8, 8, -1, 1, -9, 9, -7, 7); }
        const isSliding = pieceInfo.type !== 'King';

        for (const dir of directions) {
            let to = from + dir;
            while (this._isValidSquare(to)) {
                const targetPiece = currentBoard.getPiece(to);
                if (Math.abs(to % 8 - file) > (isSliding ? 7 : 1) && dir !== -8 && dir !== 8) break;
                
                if (targetPiece === '') {
                    moves.push({ from, to });
                } else if (this._isOpponent(targetPiece, color)) {
                    moves.push({ from, to });
                    break;
                } else {
                    break;
                }

                if (!isSliding) break;
                to += dir;
            }
        }
    }

    evaluateBoard(currentBoard) {
        let score = 0;
        for (let i = 0; i < 64; i++) {
            const pieceChar = currentBoard.getPiece(i);
            score += PIECES[pieceChar] ? PIECES[pieceChar].value : 0;
            if (pieceChar === 'P' || pieceChar === 'p') {
                if (i === 27 || i === 28 || i === 35 || i === 36) { 
                    score += (pieceChar === 'P' ? 10 : -10);
                }
            }
        }
        return score;
    }

    findBestMove(currentBoard, color) {
        this.setDepth(parseInt(document.getElementById('search-depth').value));
        let bestMove = null;
        let bestScore = color === 'w' ? -Infinity : Infinity;
        const moves = this.generateMoves(currentBoard, color);
        
        for (const move of moves) {
            const newBoard = currentBoard.clone();
            newBoard.makeMove(move.from, move.to);
            const score = this.minimax(newBoard, this.maxDepth - 1, -Infinity, Infinity, color === 'w' ? false : true);

            if (color === 'w') {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }
        return { move: bestMove, score: bestScore / 100 };
    }

    minimax(currentBoard, depth, alpha, beta, maximizingPlayer) {
        if (depth === 0) { return this.evaluateBoard(currentBoard); }
        const color = maximizingPlayer ? 'w' : 'b';
        const moves = this.generateMoves(currentBoard, color);

        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const newBoard = currentBoard.clone();
                newBoard.makeMove(move.from, move.to);
                const eval_ = this.minimax(newBoard, depth - 1, alpha, beta, false);
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, maxEval);
                if (beta <= alpha) { break; }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const newBoard = currentBoard.clone();
                newBoard.makeMove(move.from, move.to);
                const eval_ = this.minimax(newBoard, depth - 1, alpha, beta, true);
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, minEval);
                if (beta <= alpha) { break; }
            }
            return minEval;
        }
    }
}

const engine = new Engine();

function renderBoard() {
    const boardElement = document.getElementById(CHESSBOARD_ID);
    boardElement.innerHTML = ''; 

    for (let i = 0; i < 64; i++) {
        const rank = Math.floor(i / 8);
        const file = i % 8;
        const squareElement = document.createElement('div');
        const isLight = (rank + file) % 2 === 0;

        squareElement.className = `square ${isLight ? 'light' : 'dark'}`;
        squareElement.dataset.index = i;

        const pieceChar = board.getPiece(i);
        if (pieceChar) {
            const pieceInfo = PIECES[pieceChar];
            const pieceColorClass = pieceInfo.color === 'w' ? 'piece-white' : 'piece-black';
            squareElement.innerHTML = `<span class="piece ${pieceColorClass}">${pieceInfo.symbol}</span>`;
        }
        squareElement.addEventListener('click', handleSquareClick);
        if (i === selectedSquare) { squareElement.classList.add('selected'); }
        boardElement.appendChild(squareElement);
    }
    highlightValidMoves(legalMoves);
}

function updateUI(bestMove = null) {
    const score = engine.evaluateBoard(board) / 100;
    const scoreDisplay = score.toFixed(2);
    const scoreElement = document.getElementById('evaluation-score');
    const playerElement = document.getElementById('current-player');
    const statusElement = document.getElementById('status-message');
    const bestMoveDisplay = document.getElementById('best-move-display').querySelector('p');

    playerElement.textContent = currentPlayer === 'w' ? 'White' : 'Black';
    playerElement.className = `font-bold text-lg text-white px-3 py-1 rounded-full shadow-lg border ${currentPlayer === 'w' ? 'bg-gray-700 border-gray-600' : 'bg-blue-900 border-blue-800'}`;

    scoreElement.textContent = scoreDisplay;
    scoreElement.classList.remove('score-positive', 'score-negative', 'score-neutral');
    if (score > 0.5) { scoreElement.classList.add('score-positive'); } 
    else if (score < -0.5) { scoreElement.classList.add('score-negative'); } 
    else { scoreElement.classList.add('score-neutral'); }

    statusElement.textContent = `${currentPlayer === 'w' ? 'White' : 'Black'} to move.`;
    
    if (bestMove) {
        const algFrom = Board.indexToAlgebraic(bestMove.from);
        const algTo = Board.indexToAlgebraic(bestMove.to);
        bestMoveDisplay.textContent = `${algFrom}${algTo}`;
    } else {
        bestMoveDisplay.textContent = '...';
    }
    renderBoard(); 
}

function highlightValidMoves(moves) {
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('valid-move', 'valid-capture');
    });
    moves.forEach(move => {
        const targetSquare = document.querySelector(`[data-index="${move.to}"]`);
        if (targetSquare) {
            if (board.getPiece(move.to) !== '') { targetSquare.classList.add('valid-capture'); } 
            else { targetSquare.classList.add('valid-move'); }
        }
    });
}

async function handleSquareClick(event) {
    if (isEngineThinking) return;
    const target = event.currentTarget;
    const index = parseInt(target.dataset.index);
    const pieceChar = board.getPiece(index);

    if (selectedSquare === null) {
        if (pieceChar && PIECES[pieceChar].color === currentPlayer) {
            selectedSquare = index;
            target.classList.add('selected');
            legalMoves = engine.generateMoves(board, currentPlayer).filter(m => m.from === index);
            highlightValidMoves(legalMoves);
        }
    } else {
        const moveAttempt = { from: selectedSquare, to: index };
        const isValid = legalMoves.some(m => m.from === moveAttempt.from && m.to === moveAttempt.to);

        if (isValid) {
            board.makeMove(selectedSquare, index);
            currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
            selectedSquare = null;
            legalMoves = [];
            updateUI();
            if (currentPlayer === 'b') { runEngineAnalysis(); }
        } else {
            if (pieceChar && PIECES[pieceChar].color === currentPlayer) {
                document.querySelector(`[data-index="${selectedSquare}"]`).classList.remove('selected');
                selectedSquare = index;
                target.classList.add('selected');
                legalMoves = engine.generateMoves(board, currentPlayer).filter(m => m.from === index);
                highlightValidMoves(legalMoves);
            } else {
                document.querySelector(`[data-index="${selectedSquare}"]`).classList.remove('selected');
                selectedSquare = null;
                legalMoves = [];
                highlightValidMoves([]); 
            }
        }
    }
}

async function runEngineAnalysis() {
    if (isEngineThinking) return;
    isEngineThinking = true;
    const button = document.getElementById('analyse-button');
    button.disabled = true;
    button.innerHTML = '<i data-lucide="loader" class="w-5 h-5 mr-2 animate-spin"></i> Calculating...';
    
    await new Promise(resolve => setTimeout(resolve, 50)); 
    const result = engine.findBestMove(board, currentPlayer);
    
    if (result.move) {
        board.makeMove(result.move.from, result.move.to);
        currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
        updateUI(result.move);
    } else { updateUI(); }
    
    isEngineThinking = false;
    button.disabled = false;
    button.innerHTML = '<i data-lucide="eye" class="w-5 h-5 mr-2"></i> Initiate Calculation';
}

function resetGame() {
    board = new Board(INITIAL_FEN);
    currentPlayer = 'w';
    selectedSquare = null;
    legalMoves = [];
    isEngineThinking = false;
    updateUI();
}