#include "engine.h"
#include "board.h"
#include <limits>
#include <map>
#include <vector>
#include <iostream>

// A custom comparator for the Piece enum, which is required for std::map.
struct PieceComparator {
    bool operator()(const Piece& a, const Piece& b) const {
        return static_cast<int>(a) < static_cast<int>(b);
    }
};

// A map to store the value of each chess piece.
static const std::map<Piece, int, PieceComparator> pieceValues = {
    {Piece::PAWN_WHITE, 100},
    {Piece::KNIGHT_WHITE, 320},
    {Piece::BISHOP_WHITE, 330},
    {Piece::ROOK_WHITE, 500},
    {Piece::QUEEN_WHITE, 900},
    {Piece::KING_WHITE, 20000},
    {Piece::PAWN_BLACK, -100},
    {Piece::KNIGHT_BLACK, -320},
    {Piece::BISHOP_BLACK, -330},
    {Piece::ROOK_BLACK, -500},
    {Piece::QUEEN_BLACK, -900},
    {Piece::KING_BLACK, -20000},
};

// The main function that finds the best move for the current board state.
Move Engine::findBestMove(const Board& board, int depth) {
    Move bestMove;
    int bestScore = std::numeric_limits<int>::min();
    
    std::vector<Move> moves = generateMoves(board);

    // TODO: We will implement the Minimax algorithm here to find the best move.
    if (!moves.empty()) {
        bestMove = moves[0]; // Placeholder
    }

    return bestMove;
}

// The core of the AI: the Minimax algorithm with Alpha-Beta pruning.
int Engine::minimax(const Board& board, int depth, int alpha, int beta, bool maximizingPlayer) {
    // TODO: Implement the recursive minimax algorithm with pruning.
    if (depth == 0) {
        return evaluateBoard(board);
    }

    if (maximizingPlayer) {
        int maxEval = std::numeric_limits<int>::min();
        std::vector<Move> moves = generateMoves(board);
        // For each move, make the move, call minimax recursively, and undo the move.
        // For now, this is a placeholder.
        for (const auto& move : moves) {
            // Placeholder: make move
            int eval = minimax(board, depth - 1, alpha, beta, false);
            // Placeholder: undo move
            maxEval = std::max(maxEval, eval);
            alpha = std::max(alpha, eval);
            if (beta <= alpha) {
                break;
            }
        }
        return maxEval;
    } else {
        int minEval = std::numeric_limits<int>::max();
        std::vector<Move> moves = generateMoves(board);
        // For each move, make the move, call minimax recursively, and undo the move.
        // For now, this is a placeholder.
        for (const auto& move : moves) {
            // Placeholder: make move
            int eval = minimax(board, depth - 1, alpha, beta, true);
            // Placeholder: undo move
            minEval = std::min(minEval, eval);
            beta = std::min(beta, eval);
            if (beta <= alpha) {
                break;
            }
        }
        return minEval;
    }
}

// A function to evaluate the board position and return a score.
int Engine::evaluateBoard(const Board& board) {
    int score = 0;
    // Iterate over all squares on the board.
    for (int i = 0; i < 64; ++i) {
        // Get the piece on the current square.
        Piece piece = board.getPieceAt(i);
        if (piece != Piece::EMPTY) {
            // Add the value of the piece to the total score.
            score += pieceValues.at(piece);
        }
    }
    // Return the final score.
    return score;
}

// A function to generate all possible legal moves for a given position.
std::vector<Move> Engine::generateMoves(const Board& board) {
    std::vector<Move> moves;
    
    // We need to iterate through the board and find pieces.
    for (int from_square = 0; from_square < 64; ++from_square) {
        Piece piece = board.getPieceAt(from_square);
        
        // This is where you will implement the logic for each piece type.
        switch (piece) {
            case Piece::PAWN_WHITE:
                // Single square pawn move. Pawns move forward, so for white, this is -8.
                if (from_square - 8 >= 0 && board.getPieceAt(from_square - 8) == Piece::EMPTY) {
                    moves.push_back({from_square, from_square - 8});
                }
                // Double square pawn move from the starting rank (rank 2, indices 48-55).
                if (from_square >= 48 && from_square <= 55 && board.getPieceAt(from_square - 8) == Piece::EMPTY && board.getPieceAt(from_square - 16) == Piece::EMPTY) {
                    moves.push_back({from_square, from_square - 16});
                }
                // TODO: Add logic for pawn captures (diagonally).
                break;
            
            case Piece::PAWN_BLACK:
                // Single square pawn move. Black pawns move forward, so this is +8.
                if (from_square + 8 < 64 && board.getPieceAt(from_square + 8) == Piece::EMPTY) {
                    moves.push_back({from_square, from_square + 8});
                }
                // Double square pawn move from the starting rank (rank 7, indices 8-15).
                if (from_square >= 8 && from_square <= 15 && board.getPieceAt(from_square + 8) == Piece::EMPTY && board.getPieceAt(from_square + 16) == Piece::EMPTY) {
                    moves.push_back({from_square, from_square + 16});
                }
                // TODO: Add logic for pawn captures (diagonally).
                break;

            case Piece::KNIGHT_WHITE:
                // TODO: Add logic for white knight moves.
                break;
            
            case Piece::KNIGHT_BLACK:
                // TODO: Add logic for black knight moves.
                break;
            
            // TODO: Implement the logic for all other pieces (Bishop, Rook, Queen, King).
        }
    }

    return moves;
}