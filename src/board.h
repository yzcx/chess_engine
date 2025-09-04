#pragma once

#include <vector>
#include <string>

// Enum to represent the different types of pieces.
enum class Piece {
    EMPTY,
    PAWN_WHITE, KNIGHT_WHITE, BISHOP_WHITE, ROOK_WHITE, QUEEN_WHITE, KING_WHITE,
    PAWN_BLACK, KNIGHT_BLACK, BISHOP_BLACK, ROOK_BLACK, QUEEN_BLACK, KING_BLACK
};

// The main class to represent the chess board and its state.
class Board {
public:
    Board();
    std::string toString() const;
    Piece getPieceAt(int square) const;

private:
    std::vector<Piece> board;
};