#pragma once

#include "board.h"
#include <vector>
#include <map>
#include <limits>

// Struct to represent a chess move.
// This is the only place this struct should be defined.
struct Move {
    int from;
    int to;
};

// The core AI for the chess analyser.
class Engine {
public:
    // Finds the best move for the current board state using the search algorithm.
    Move findBestMove(const Board& board, int depth);

    // Evaluates a board position and returns a numerical score.
    int evaluateBoard(const Board& board);

private:
    // The main recursive minimax function with alpha-beta pruning.
    int minimax(const Board& board, int depth, int alpha, int beta, bool maximizingPlayer);

    // Generates all legal moves for the current board state.
    std::vector<Move> generateMoves(const Board& board);
};