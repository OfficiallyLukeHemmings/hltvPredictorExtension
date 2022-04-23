// Coutdown innerText
let countdown = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.standard-box.teamsBox > div.timeAndEvent > div.countdown").innerText;
if (countdown == null) {
    // Try for a LIVE game instead
    countdown = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.standard-box.teamsBox > div.timeAndEvent > div.countdown.countdown-live")
}

// Get features from upcoming/ongoing game to fetch to API for result.
if (countdown != "Match over") {
    
    window.addEventListener("load", (e => {
        // Ensuring the DOM is loaded before seeking the data
        const gameDetails = getGameDetails();
    }))
}


function getBettingDiff() {
    // Testing getting betting odds difference from extension
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

    // Return the mean betting difference (absolute value) to 3dp.
    return (bettingDifferencesSums / validBettingRows).toFixed(3)
}


function getTeamRanks() {
    const teamRanks = {
        team1Rank: null,
        team2Rank: null
    };

    rankingDivs = document.getElementsByClassName("teamRanking");
    teamRanks.team1Rank = parseInt(rankingDivs[0].firstElementChild.lastChild.data.substring(1));
    teamRanks.team2Rank = parseInt(rankingDivs[1].firstElementChild.lastChild.data.substring(1));    

    return teamRanks;
}


function getGameDetails() {
    // Creating gameDetails object to be sent to ML API
    const gameDetails = {
        eventType: null,
        team1Rank: null,
        team2Rank: null,
        bettingOddsDiff: null
    };

    gameDetails.bettingOddsDiff = getBettingDiff();
    const teamRanks = getTeamRanks();
    gameDetails.team1Rank = teamRanks.team1Rank;
    gameDetails.team2Rank = teamRanks.team2Rank;

    console.log(gameDetails);
    return gameDetails;
}
