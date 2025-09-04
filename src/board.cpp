#include "board.h"
#include <iostream>

// Constructor to set up the initial board position.
Board::Board() {
    board.resize(64);
    // Set up the initial pieces for both white and black.
    // The board is represented as a 1D vector of 64 squares.
    board[0] = Piece::ROOK_WHITE;
    board[1] = Piece::KNIGHT_WHITE;
    board[2] = Piece::BISHOP_WHITE;
    board[3] = Piece::QUEEN_WHITE;
    board[4] = Piece::KING_WHITE;
    board[5] = Piece::BISHOP_WHITE;
    board[6] = Piece::KNIGHT_WHITE;
    board[7] = Piece::ROOK_WHITE;

    for (int i = 8; i < 16; ++i) {
        board[i] = Piece::PAWN_WHITE;
    }

    for (int i = 16; i < 48; ++i) {
        board[i] = Piece::EMPTY;
    }

    for (int i = 48; i < 56; ++i) {
        board[i] = Piece::PAWN_BLACK;
    }

    board[56] = Piece::ROOK_BLACK;
    board[57] = Piece::KNIGHT_BLACK;
    board[58] = Piece::BISHOP_BLACK;
    board[59] = Piece::QUEEN_BLACK;
    board[60] = Piece::KING_BLACK;
    board[61] = Piece::BISHOP_BLACK;
    board[62] = Piece::KNIGHT_BLACK;
    board[63] = Piece::ROOK_BLACK;
}

// Function to print the board to the console.
std::string Board::toString() const {
    std::string s = "";
    for (int i = 0; i < 64; ++i) {
        if (i % 8 == 0) {
            s += "\n";
        }
        switch (board[i]) {
            case Piece::EMPTY: s += " "; break;
            case Piece::PAWN_WHITE: s += "P"; break;
            case Piece::KNIGHT_WHITE: s += "N"; break;
            case Piece::BISHOP_WHITE: s += "B"; break;
            case Piece::ROOK_WHITE: s += "R"; break;
            case Piece::QUEEN_WHITE: s += "Q"; break;
            case Piece::KING_WHITE: s += "K"; break;
            case Piece::PAWN_BLACK: s += "p"; break;
            case Piece::KNIGHT_BLACK: s += "n"; break;
            case Piece::BISHOP_BLACK: s += "b"; break;
            case Piece::ROOK_BLACK: s += "r"; break;
            case Piece::QUEEN_BLACK: s += "q"; break;
            case Piece::KING_BLACK: s += "k"; break;
        }
        s += "\t";
    }
    return s;
}

// Returns the piece at a given square.
Piece Board::getPieceAt(int square) const {
    if (square >= 0 && square < 64) {
        return board[square];
    }
    return Piece::EMPTY;
}
