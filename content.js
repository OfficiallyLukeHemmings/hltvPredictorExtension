async function createAndRenderPrediction() {

  async function postRequest(gameDetails) {
    // Handling POST request to API
    let predictions = await fetch("https://hltv-prediction-extension-api.ew.r.appspot.com/", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(gameDetails)
    }).then(res => {
      // If status is anything but 200, throw error and preventing rendering
      // of Prediction Box on page. 
      if (res.status !== 200) {
        throw new Error("Invalid response status from POST request");
      }
      return res.json();
    });
    return predictions;
  }

  async function generatePredictionString(gameDetails) {
    predictions = await postRequest(gameDetails);
    // Predictions will be either 1 (truthy) or 0 (falsy), hence the use of 
    // ternary operators to condense the const assignment.
    const optimisticPrediction = predictions["optimistic-prediction"]
      ? "😎\n You will likely enjoy this game"
      : "😴\n You likely won't enjoy this game";

    const pessimisticPrediction = predictions["pessimistic-prediction"]
      ? "😎\n You will likely enjoy this game"
      : "😴\n You likely won't enjoy this game";

    console.log("PREDICTIONS:", optimisticPrediction, pessimisticPrediction);
    
    // Preparing PredictionBox text
    let predictionText = `Optimistic Model Prediction: ${optimisticPrediction}

    Pessimistic Model Prediction: ${pessimisticPrediction}`; 

    return predictionText;
  }

  if (getIsGameIncomplete()) {
    // Ensuring the DOM is loaded before seeking the data
    window.addEventListener("load", async (e) => {
      try {
        // Get features from upcoming/ongoing game to fetch to API for result
        const gameDetails = getGameDetails();
        console.log(gameDetails);
        // If any game details are missing throw an error.
        const missingDetail = Object.values(gameDetails).some(
          (detail) => detail === null);
        if (missingDetail) throw new Error("Game detail missing");
        
        predictionText = await generatePredictionString(gameDetails);
  
        // Getting correct div for addition of prediction detail to page
        const div = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.g-grid.maps > div.col-6.col-7-small");
        
        // Creation of span subtitle
        const span = document.createElement("span");
        span.classList.add("headline");
        span.innerHTML = "HLTV Extension Predictions";
  
        // Creation of prediction box (nested div)
        const predictionOuterBox = document.createElement("div");
        predictionOuterBox.classList.add("prediction-box", "standard-box", "veto-box");
        // (changing style to be easily identifiable by users)
        predictionOuterBox.style.color = "#ffffff";
        predictionOuterBox.style.backgroundColor = "#435971";
        predictionOuterBox.style.fontWeight = "bold";
        predictionOuterBox.style.fontSize = "16px"
  
        const predictionInnerBox = document.createElement("div");
        predictionInnerBox.classList.add("padding", "preformatted-text");
        predictionInnerBox.innerText = predictionText
        predictionOuterBox.appendChild(predictionInnerBox);
  
        // Appending span subtitle and prediction box to page
        div.prepend(predictionOuterBox);
        div.prepend(span);
  
      } catch (err) {
        console.log(err.message);
      }
    });
  } else {
    console.log("Upcoming or live game not found");
  }
}


function getIsGameIncomplete(){
  // Coutdown innerText
  let countdown = null;

  try {
      countdown = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.standard-box.teamsBox > div.timeAndEvent > div.countdown").innerText;
  } catch (err) {
    console.log(err.message);
    // Try for a LIVE game instead
    try {
      if (countdown == null) {
        countdown = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.standard-box.teamsBox > div.timeAndEvent > div.countdown.countdown-live").innerText;  
      }
    } catch (err) {
      console.log(err.message);
    }
  }
  console.log(countdown.toLowerCase() !== "match over");
  return (countdown.toLowerCase() !== "match over");
}


function getGameType() {
  // 0 = Online; 1 = LAN; 2 = Major
  const eventTitle = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.standard-box.teamsBox > div.timeAndEvent > div.event.text-ellipsis > a");
  // If event is a 'major' event - 'major' will be included in the event
  // title if so...
  if (eventTitle.innerText.toLowerCase().includes("major")) {
    return 2; // 2 = 'Major' event
  } else {
    const infoBoxText = document.querySelector("body > div.bgPadding > div.widthControl > div.colCon > div.contentCol > div.match-page > div.g-grid.maps > div.col-6.col-7-small > div.standard-box.veto-box > div")
      .innerText
      .toLowerCase();

    // (Below) Brackets surrounding gametype in if statement in case notes
    // section of info box contains gametype in an upcoming event's title.
    if (infoBoxText.includes("(lan)")) {
      return 1; // 1 = 'LAN' event
    } else if (infoBoxText.includes("(online)")) {
      return 0; // 0 = 'Online' event
    } else {
      console.log("Game type not found");
    }
  }
}


function getBettingDiff() {
  // Testing getting betting odds difference from extension
  const bettingTable = document.querySelector("#betting > div.g-grid > div.col-8.mobile-normal-priority > div.match-betting-list.standard-box > table > tbody");
  console.log(bettingTable)
  const rowsArray = Array.from(bettingTable.rows);

  // Removing title row
  rowsArray.shift();
  // For each row, calculate a difference and
  // TODO: Try catch for each row here - if it's not included by some companies

  let bettingDifferencesSums = 0;
  let validBettingRows = 0;

  rowsArray.forEach((row) => {
    try {
      let leftVal = row.children[1].innerText;
      let rightVal = row.children[3].innerText;
      if (leftVal && rightVal) {
        let bettingDifference = Math.abs(
          parseFloat(leftVal) - parseFloat(rightVal)
        );
        if (bettingDifference) {
          // I.e. if bettingDifference != NaN
          validBettingRows++;
          bettingDifferencesSums += bettingDifference;
        }
      }
    } catch (error) {
      console.log("Error while reading betting rows -", error);
    }
  });

  // Return the mean betting difference (absolute value) to 3dp.
  return parseFloat((bettingDifferencesSums / validBettingRows).toFixed(3));
}


function getTeamRanks() {
  const teamRanks = {
    team1Rank: null,
    team2Rank: null,
  };

  rankingDivs = document.getElementsByClassName("teamRanking");
  teamRanks.team1Rank = parseInt(
    rankingDivs[0].firstElementChild.lastChild.data.substring(1)
  );
  teamRanks.team2Rank = parseInt(
    rankingDivs[1].firstElementChild.lastChild.data.substring(1)
  );

  return teamRanks;
}


function getGameDetails() {
  // Creating gameDetails object to be sent to ML API
  const gameDetails = {
    "eventType": null,
    "team1Rank": null,
    "team2Rank": null,
    "bettingOddsDiff": null,
  };

  // Getting event type
  gameDetails.eventType = getGameType();
  // Getting betting odds difference
  gameDetails.bettingOddsDiff = getBettingDiff();
  // Getting team ranks
  const teamRanks = getTeamRanks();
  gameDetails.team1Rank = teamRanks.team1Rank;
  gameDetails.team2Rank = teamRanks.team2Rank;

  return gameDetails;
}

createAndRenderPrediction();
