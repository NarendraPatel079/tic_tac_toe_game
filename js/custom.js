const winning_probability = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [1, 4, 7], [2, 5, 8], [3, 6, 9], [1, 5, 9], [3, 5, 7]];
const horizontal_tile_combination = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
const vertical_tile_combination = [[1, 4, 7], [2, 5, 8], [3, 6, 9]];
const slide_tile_combination = [[1, 5, 9]];
const rev_slide_tile_combination = [[3, 5, 7]];
const default_player1_name = 'Player 1';
const default_player1_sign = 'X';

const default_player2_name = 'Player 2';
const default_player2_sign = 'O';

var game_type = 1;
var level = 1;
var current_move = 1;
var game_finished = false;
var winner = null;
var winner_tile_combination = [];
var winner_detail_saved = false;

var player1_name = default_player1_name;
var player1_sign = default_player1_sign;
var player1_winning_count = 0;
var player1_moves = [];

var player2_name = default_player2_name;
var player2_sign = default_player2_sign;
var player2_winning_count = 0;
var player2_moves = [];

var draw_count = 0;
var total_count = 0;

$(document).ready(function () {
    if ($('.alph_sign').length) {
        for (var i = 65; i <= 90; i++) {
            var char = String.fromCharCode(i);
            var player1_selected = '';
            var player2_selected = '';
            var player1_disabled = '';
            var player2_disabled = '';
            if (char == 'X') {
                player1_selected = 'selected="selected"';
                player2_disabled = 'disabled="disabled"';
            } else if (char == 'O') {
                player2_selected = 'selected="selected"';
                player1_disabled = 'disabled="disabled"';
            }

            $('#player1_sign').append('<option value="' + char + '" ' + player1_selected + ' ' + player1_disabled + '>' + char + '</option>');
            $('#player2_sign').append('<option value="' + char + '" ' + player2_selected + ' ' + player2_disabled + '>' + char + '</option>');
        }
    }

    $('input[name="game_type"]').click(function () {
        var value = $(this).val();
        if (value == '2') {
            $('.player2_name_div').show();
        } else {
            $('.player2_name_div').hide();
        }
    });

    $('#startBtn').click(function () {
        $('#startBtn').addClass('disabled');
        $('.tile-container, #resetBtn').show();
        $('#ttt_form input, #ttt_form select').prop('disabled', true);
        
        game_type = $('input[name="game_type"]:checked').val();
        var p1_name = $.trim($('#player1_name').val());
        if (p1_name != '') {
            player1_name = p1_name;
        }
        if ($('#player2_name').is(':visible')) {
            var p2_name = $.trim($('#player2_name').val());
            if (p2_name != '') {
                player2_name = p2_name;
            }
        } else {
            player2_name = default_player2_name;
        }
        
        var p1_sign = $.trim($('#player1_sign').val());
        if (p1_sign != '') {
            player1_sign = p1_sign;
        }
        if ($('#player2_sign').is(':visible')) {
            var p2_sign = $.trim($('#player2_sign').val());
            if (p2_sign != '') {
                player2_sign = p2_sign;
            }
        } else {
            player2_sign = default_player2_sign;
        }
        
        $(".player_name:eq(0)").text(player1_name);
        $(".player_name:eq(1)").text(player2_name);
        
        setCurrentMoveMessage();
    });

    $('#resetBtn').click(function () {
        resetGame();
    });

    $('#restartBtn').click(function () {
        restartGame();
    });

    $('.tile').on('click', function (e) {
        e.stopImmediatePropagation();
        tileMove(this);
    });
});

function tileMove(element) {
    if (!$(element).length) {
        console.log("Element not found.");
        return false;
    }
    
    $(element).addClass('pointer-events-none marked');
    $(element).parent('div').addClass('cursor-not-allowed');
    $(element).attr('occupied_by', current_move);
    
    if (game_finished === false) {
        var tile_id = $(element).attr('data-id');
        tile_id = parseInt(tile_id);
        // console.log("tile_id = " + tile_id);
        // console.log("current_move = " + current_move);
        
        if (current_move == 1) {
            // put sing of player 1
            $(element).text(player1_sign);

            // push tile number to player1_moves array
            player1_moves.push(tile_id);
            checkWinningPossibility(current_move);
            
            if (game_type == 2) {
                // transfer move to player 2
                current_move = 2;
            } else {
                computerTurn();
            }
        } else if (current_move == 2) {
            // put sing of player 2
            $(element).text(player2_sign);

            // push tile number to player2_moves array
            player2_moves.push(tile_id);
            checkWinningPossibility(current_move);

            // transfer move to player 1
            current_move = 1;
        }
        // console.log("game_finished = " + game_finished);
        
        if (game_finished === false && $(".tile.marked").length > 8) {
            game_finished = true;
            saveWinnerDetails();
        } else if (game_finished === true || $(".tile.marked").length > 8) {
            saveWinnerDetails();
        }
        setCurrentMoveMessage();
    }
    
    return false;
}

function setCurrentMoveMessage() {
    if (game_finished === false) {
        if (current_move == 1) {
            $('.current_move span').text(player1_name);
        } else if (current_move == 2) {
            $('.current_move span').text(player2_name);
        }
        return true;
    } else {
        $('.current_move').hide();
    }
    return false;
}

function computerTurn() {
    if (game_type == 1 && game_finished === false) {
        var random_tile = getRandomTile();
        if (random_tile) {
            // transfer move to player 2
            current_move = 2;
            setCurrentMoveMessage();
            
            tileMove(random_tile);
            return true;
        }
    }
    return false;
}

function checkWinningPossibility(player) {
    var marked_tiles = $(".tile.marked");
    // console.log(marked_tiles);
    var marked_tile_count = marked_tiles.length;
    // console.log("marked_tile_count = " + marked_tile_count);
    // console.log("player = " + player);
    if (marked_tile_count > 3) {
        var check_moves = player1_moves;
        if (player == 2) {
            check_moves = player2_moves;
        }
        // console.log(check_moves);
        
        $.each(check_moves, function(pm_key, tile_number) {
            // console.log("tile_number = " + tile_number);
            $.each(winning_probability, function(wp_set_key, wp_set) {
                if ($.inArray(tile_number, wp_set) >= 0) {
                    var matchedLength = 0;

                    $.each(wp_set, function(wp_key, wp_index) {
                        // console.log("wp_index = " + wp_index);
                        if ($.inArray(wp_index, check_moves) >= 0) {
                            matchedLength++;
                        }
                    });
                    // console.log("matchedLength = " + matchedLength);

                    if (matchedLength > 2) {
                        winner_tile_combination = wp_set;
                        game_finished = true;
                        if (player == 2) {
                            winner = 2;
                        } else {
                            winner = 1;
                        }
                        return false;
                    }
                }
            });
        });
    }
    return false;
}

function saveWinnerDetails(){
    if (game_finished === true && winner_detail_saved === false) {
        var msg = 'Game Over.';
        if (winner == 1) {
            // game is winner is player 1
            msg += ' ' + player1_name + ' Wins!';
            player1_winning_count++;
            $(".winning_count:eq(0)").text(player1_winning_count);
        } else if (winner == 2) {
            // game is winner is player 2
            msg += ' ' + player2_name + ' Wins!';
            player2_winning_count++;
            $(".winning_count:eq(1)").text(player2_winning_count);
        } else {
            // game is draw
            msg = 'Game is draw. Please try again.';
            draw_count++;
            $(".winning_count:eq(2)").text(draw_count);
        }
        $('#game_result_msg').html(msg);
        $('#game_result_msg').show();
        
        total_count = (player1_winning_count + player2_winning_count + draw_count);
        $(".winning_count:eq(3)").text(total_count);
        
        if ($(".tile.marked").length < 9) {
            // disable remain tiles to prevent click
            disableRemainTiles();
        }
        makeWinnerTileCombinationDesign();
        
        winner_detail_saved = true;
    }
    return false;
}

function getRandomTile() {
    var marked_tiles = $(".tile:not(.marked)");
    // console.log(marked_tiles);
    if (marked_tiles.length) {
        var random_tile = marked_tiles[Math.floor(Math.random() * marked_tiles.length)];
        // console.log(random_tile);
        return random_tile;
    }
    return false;
}

function resetGame() {
    restartGame();
    player1_winning_count = 0;
    player2_winning_count = 0;
    draw_count = 0;
    total_count = 0;
    
    $('#startBtn').removeClass('disabled');
    $('.tile-container, #resetBtn').hide();
    $('#ttt_form input, #ttt_form select').prop('disabled', false);
    $(".winning_count").text(0);
}

function restartGame() {
    resetTile();
    
    // transfer move to player 1
    current_move = 1;
    game_finished = false;
    winner = null;
    winner_detail_saved = false;
    winner_tile_combination = [];
    
    $('#game_result_msg').html('');
    $('#game_result_msg').hide();
    $('.current_move').show();
    $('.tile_strike').remove();
    setCurrentMoveMessage();
}

function resetTile() {
    $('.tile').text('');
    $('.tile').removeClass('pointer-events-none marked');
    $('.tile').parent('div').removeClass('cursor-not-allowed');
    
    // reset the player moves
    player1_moves = [];
    player2_moves = [];
}

function disableRemainTiles() {
    if ($(".tile:not(.marked)").length) {
        $(".tile:not(.marked)").each(function() {
            $(this).addClass('pointer-events-none marked');
            $(this).parent('div').addClass('cursor-not-allowed');
        });
    }
}

function makeWinnerTileCombinationDesign() {
    if (winner_tile_combination.length) {
        var strike_set_type = '';
        var strike_set = [];
        $.each(rev_slide_tile_combination, function(rstc_key, rstc_set) {
            var slide_tile_match_count = 0;
            $.each(winner_tile_combination, function(wtc_key, wtc_index) {
                if ($.inArray(wtc_index, rstc_set) >= 0) {
                    slide_tile_match_count++;
                }
            });
            if (slide_tile_match_count == 3) {
                strike_set = rstc_set;
                strike_set_type = 'rev_slide';
            }
        });
        
        if (!strike_set.length) {
            $.each(slide_tile_combination, function(stc_key, stc_set) {
                var slide_tile_match_count = 0;
                $.each(winner_tile_combination, function(wtc_key, wtc_index) {
                    if ($.inArray(wtc_index, stc_set) >= 0) {
                        slide_tile_match_count++;
                    }
                });
                if (slide_tile_match_count == 3) {
                    strike_set = stc_set;
                    strike_set_type = 'slide';
                }
            });
        }
        
        if (!strike_set.length) {
            $.each(vertical_tile_combination, function(vtc_key, vtc_set) {
                var vertical_tile_match_count = 0;
                $.each(winner_tile_combination, function(wtc_key, wtc_index) {
                    if ($.inArray(wtc_index, vtc_set) >= 0) {
                        vertical_tile_match_count++;
                    }
                });
                if (vertical_tile_match_count == 3) {
                    strike_set = vtc_set;
                    strike_set_type = 'vertical';
                }
            });
        }
        
        if (!strike_set.length) {
            $.each(horizontal_tile_combination, function(htc_key, htc_set) {
                var horizontal_tile_match_count = 0;
                $.each(winner_tile_combination, function(wtc_key, wtc_index) {
                    if ($.inArray(wtc_index, htc_set) >= 0) {
                        horizontal_tile_match_count++;
                    }
                });
                if (horizontal_tile_match_count == 3) {
                    strike_set = htc_set;
                    strike_set_type = 'horizontal';
                }
            });
        }
        
        // console.log("strike_set_type = " + strike_set_type);
        // console.log(strike_set);
        if (strike_set.length && strike_set_type != '') {
            var class_name = strike_set_type + '_tile_strike';
            var last_key = (strike_set.length - 1);
            $.each(strike_set, function(ss_key, ss_val) {
                if (ss_key == last_key) {
                    class_name += '_last';
                }
                var strike_html = '<div class="tile_strike ' + class_name + '"></div>';
                $('#tile_' + ss_val).after(strike_html);
            });
        }
    }
}