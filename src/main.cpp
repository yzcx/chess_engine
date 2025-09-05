#include "board.h"
#include "engine.h"
#include <iostream>

/**
 * @brief The main entry point of the program.
 * * This function initializes a new chess board and prints its
 * starting position to the console.
 * * @return int Returns 0 on successful execution.
 */
int main() {
    // Create an instance of the Board class.
    Board chess_board;

    // Create an instance of the Engine class.
    Engine chess_engine;

    // Print the initial state of the board to the console.
    std::cout << "Initial Chess Board State:\n" << std::endl;
    std::cout << chess_board.toString() << std::endl;

    // Evaluate the starting board and print the score.
    int board_score = chess_engine.evaluateBoard(chess_board);
    std::cout << "Initial board score: " << board_score << std::endl;

    // Generate and print all possible moves for the starting position.
    std::vector<Move> moves = chess_engine.generateMoves(chess_board);
    std::cout << "Generated " << moves.size() << " possible moves:" << std::endl;
    for (const auto& move : moves) {
        std::cout << "Move from " << move.from << " to " << move.to << std::endl;
    }

    return 0;
}