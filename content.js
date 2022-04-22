// 
const countdown = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.standard-box.teamsBox > div.timeAndEvent > div.countdown").innerText;

// If match is not complete...
if (countdown != "Match over") {
    // Get features here to fetch to API for result
    const bettingOddsDiff = getBettingOdds()
}


function getBettingOdds() {
    // Testing getting betting odds from extension
    const bettingTable = document.querySelector("#betting > div.world-vVP3JBh5AswY4yBD-list > div > div.three-quarter-width > div > table > tbody");

    const rowsArray = Array.from(bettingTable.rows);

    // Removing title row
    rowsArray.shift();
    // For each row, calculate a difference and 
    // TODO: Try catch for each row here - if it's not included by some companies

    let bettingDifferencesSums = 0;
    let validBettingRows = 0;

    rowsArray.forEach(row =>{
        try {
            let leftVal = row.children[1].innerText;
            let rightVal = row.children[3].innerText;
            if (leftVal && rightVal) {
                let bettingDifference = Math.abs(parseFloat(leftVal)-parseFloat(rightVal));
                if (bettingDifference) {
                    // I.e. if bettingDifference != NaN
                    validBettingRows++;
                    bettingDifferencesSums += bettingDifference;
                }
            }
        } catch (error) {
            console.log('Error while reading betting rows -', error);
        }
    });

    console.log('Combined Betting Odds Difference:', bettingDifferencesSums/validBettingRows);    
}