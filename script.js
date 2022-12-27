const gameBoard = (() => {
    let board = [...Array(9)].map(() => "");

    function setField(position, marker){
        board[position] = marker;
    }

    function getField(position){
        return board[position];
    }

    function resetBoard(){
        board = [...Array(9)].map(() => "");
    }

    //return array with the indices of fields not marked by the player or bot
    function getUnsetFields(){
        let currentIndex = 0;
        let unsetFields = board.reduce((result, current) => {
            
            if (current === "") {
                result.push(board.indexOf(current, currentIndex).toString());
            }
            currentIndex++;
            return result;
        },[]);

        return unsetFields;
    }

    return {setField, getField, resetBoard, getUnsetFields};
})();

function playerFactory(name, marker){
    const getName = () => name;
    const getMarker = () => marker;
    let wins = 0;

    function setWins(x){
        wins = x;
    }

    function getWins(){
        return wins;
    }

    return {getName, getMarker, setWins, getWins};
};

const displayController = (() => {
    const cells = document.querySelectorAll(".cell");
    const messageBox = document.getElementById("message");
    const restartButton = document.querySelector(".restart");
    const playerWinsDisplay = document.getElementById("player-wins");
    const botWinsDisplay = document.getElementById("bot-wins");

    restartButton.addEventListener("click", restart);
    addBoardListeners();
    
    function play(e){
        gameController.play(e.target.dataset.index);
    }

    function removeBoardListeners(){
        cells.forEach(element => {
            element.removeEventListener("click", play);
        });
    }

    function addBoardListeners(){
        cells.forEach(element => {
            element.addEventListener("click", play);
        });
    }

    function addBLToUnselected(){
        cells.forEach(element => {
            if (element.classList.contains("not-selected")) {
                element.addEventListener("click", play);
            }
        });
    }

    //remove EventListener after a cell got marked
    function setMarked(cell){
        const markedCell = Array.from(cells).find(element => element.dataset.index === cell.toString());
        markedCell.removeEventListener("click", play);
        markedCell.classList.remove("not-selected");
    }

    function setUnmarked(){
        cells.forEach(element => {
            element.classList.add("not-selected");
        });
    }

    //display current game board
    function updateBoard(){
        cells.forEach(element => {
            element.innerHTML = gameBoard.getField(element.dataset.index);
        });
    }

    function showMessage(message){
        messageBox.innerHTML = message;
    }

    function restart(){
        gameBoard.resetBoard();
        updateBoard();
        gameController.resetGame();
        removeBoardListeners();
        addBoardListeners();
        unhighlightWinCombination();
        setUnmarked();
    }

    function displayScore(player, bot){
        playerWinsDisplay.innerHTML = `Player: ${player.getWins()}`;
        botWinsDisplay.innerHTML = `Bot: ${bot.getWins()}`;
    }

    function highlightBotChoice(chosenField){
        const field = cells.item(chosenField);
        field.classList.add("bot-choice");
    }
    
    function unhighlightBotChoice(chosenField){
        const field = cells.item(chosenField);
        field.classList.remove("bot-choice");
    }

    function highlightWinCombination(wincom){
        wincom.forEach(element => {
            cells.item(element).classList.add("win-comb");
        });
    }

    function unhighlightWinCombination(){
        cells.forEach(cell => cell.classList.remove("win-comb"));
    }

    return {updateBoard, showMessage, setMarked, displayScore, removeBoardListeners, 
        highlightBotChoice, unhighlightBotChoice, highlightWinCombination, addBLToUnselected};
})();

const gameController = (() => {
    const players = [playerFactory("Player", "X"), playerFactory("Bot", "O")];
    let round = 0;
    let player = players[round % 2];

    const winCombinations = [
        ["0", "1", "2"],
        ["3", "4", "5"],
        ["6", "7", "8"],
        ["0", "3", "6"],
        ["1", "4", "7"],
        ["2", "5", "8"],
        ["0", "4", "8"],
        ["2", "4", "6"]
    ];
    
    displayController.showMessage(`${player.getName()}&acute;s turn`);
    displayController.displayScore(players[0], players[1]);

    function play(field){
        gameBoard.setField(field, player.getMarker());
        displayController.updateBoard();
        displayController.setMarked(field);
        round++;
        
        if (checkWinCondition(field, player)) {
            displayController.showMessage(`${player.getName()} has won!`);
            displayController.removeBoardListeners();
            player.setWins(player.getWins() + 1);
            const winCom = getWinCombination(player);
            displayController.highlightWinCombination(winCom);
            displayController.displayScore(players[0], players[1]);
        }else if (round === 9) {
            displayController.showMessage('It&acute;s a draw!');
        }else {
            player = players[round % 2];
            displayController.showMessage(`${player.getName()}&acute;s turn`);
            //if (round % 2) === 1 = bots turn
            //get indices of unmarked fields and choose one randomly
            if ((round % 2) === 1) {
                displayController.removeBoardListeners();
                setTimeout(() => {
                    const unsetFields = gameBoard.getUnsetFields();
                    const chosenField = unsetFields[Math.floor(Math.random() * unsetFields.length)];
                    displayController.highlightBotChoice(chosenField);
                    setTimeout(() => {
                        gameController.play(chosenField);
                        displayController.unhighlightBotChoice(chosenField);
                        displayController.addBLToUnselected();
                    }, 350);
                }, 500);
            }
        }
    }

    function checkWinCondition(field, player){

        return winCombinations
            .filter(combination => combination.includes(field))
            .some(combination => combination.every(x => gameBoard.getField(x) === player.getMarker()));
    }

    function getWinCombination(player){

        return winCombinations.filter(combination => {
            let flag = true;
            combination.forEach(element => {
                flag = flag && (gameBoard.getField(Number(element)) === player.getMarker());
            });
            return flag;
        }).flat();
    }

    function resetGame(){
        round = 0;
        player = players[round % 2];
        displayController.showMessage(`${player.getName()}&acute;s turn`);
    }

    return {play, resetGame};
})();