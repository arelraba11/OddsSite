document.addEventListener("DOMContentLoaded", () => {
  // Check if token exists
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "/");

  // Decode token to extract username
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload?.username || "User";
    document.getElementById("username-display").textContent = username;
  } catch (err) {
    console.error("Invalid token:", err);
    return (window.location.href = "/");
  }

  // DOM elements
  const loadOddsBtn = document.getElementById("load-odds-btn");
  const sportsContainer = document.getElementById("sports-container");
  const slipContainer = document.getElementById("bet-slip");
  const totalOddsDisplay = document.getElementById("total-odds-display");
  const pointsInput = document.getElementById("stake-input");
  const winDisplay = document.getElementById("potential-return");
  const submitBtn = document.getElementById("submit-bets-btn");

  // Stores all selected bets
  const userBets = [];

  // Load match odds from backend
  loadOddsBtn.addEventListener("click", () => {
    fetch("/api/odds/sports")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch odds.");
        return res.json();
      })
      .then((data) => {
        sportsContainer.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
          sportsContainer.innerHTML = "<p>No matches found.</p>";
          return;
        }

        // Render each match and odds
        data.forEach((match) => {
          const bookmaker = match.bookmakers?.[0];
          const outcomes = bookmaker?.markets?.find((m) => m.key === "h2h")?.outcomes;
          if (!outcomes) return;

          const div = document.createElement("div");
          div.className = "sport-card";
          div.innerHTML = `
            <div class="match-header">${match.home_team} vs ${match.away_team}</div>
            <div class="match-time">Kickoff: ${new Date(match.commence_time).toLocaleString()}</div>
            <div class="odds-options">
              ${outcomes.map((o) => `
                <button class="bet-option"
                  data-match="${match.id}"
                  data-home="${match.home_team}"
                  data-away="${match.away_team}"
                  data-pick="${o.name}"
                  data-odd="${o.price}">
                  ${o.name} @ ${o.price}
                </button>
              `).join("")}
            </div>
          `;
          sportsContainer.appendChild(div);
        });
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        sportsContainer.innerText = "Error loading odds.";
      });
  });

  // Handle click on betting option
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("bet-option")) return;

    const { match, home, away, pick, odd } = e.target.dataset;

    // Prevent duplicate selections
    const exists = userBets.some((b) => b.match === match && b.pick === pick);
    if (exists) {
      alert("This selection is already in your bet slip.");
      return;
    }

    // Add selected bet to the bet slip
    const bet = { match, home, away, pick, odd: parseFloat(odd) };
    userBets.push(bet);
    renderBetSlip();
  });

  // Render current bet slip UI and calculate odds and potential return
  const renderBetSlip = () => {
    slipContainer.innerHTML = userBets
      .map((b) => `
        <div class="bet-entry">
          <p>${b.home} vs ${b.away}</p>
          <p>Pick: <strong>${b.pick}</strong> @ ${b.odd}</p>
        </div>
      `)
      .join("");

    // Calculate total odds
    const total = userBets.reduce((acc, b) => acc * b.odd, 1);
    totalOddsDisplay.textContent = `Total Odds: ${total.toFixed(2)}`;

    // Calculate potential return if valid stake entered
    const points = parseFloat(pointsInput.value);
    if (!isNaN(points)) {
      const potentialWin = points * total;
      winDisplay.textContent = `Potential Return: ${potentialWin.toFixed(2)}`;
    } else {
      winDisplay.textContent = "";
    }
  };

  // Recalculate potential return when user types stake amount
  pointsInput.addEventListener("input", renderBetSlip);

  // Handle bet submission (simulation)
  submitBtn.addEventListener("click", () => {
    if (userBets.length === 0) {
      alert("No bets selected.");
      return;
    }
  
    const total = userBets.reduce((acc, b) => acc * b.odd, 1);
    const points = parseFloat(pointsInput.value);
  
    if (isNaN(points) || points <= 0) {
      alert("Please enter a valid amount of points to bet.");
      return;
    }
  
    // Get the token for auth
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to place a bet.");
      return;
    }
  
    // Prepare the payload to send to backend
    const payload = {
      bets: userBets,
      totalOdds: total.toFixed(2),
      stake: points,
      potentialWin: (points * total).toFixed(2),
    };
  
    fetch("/api/bets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.bet && data.bet._id) {
          alert("Bet saved successfully!");
          userBets.length = 0;
          slipContainer.innerHTML = "";
          pointsInput.value = "";
          totalOddsDisplay.textContent = "Total Odds: 1.00";
          winDisplay.textContent = "";
        } else {
          alert(data.message || "Failed to save bet.");
        }
      })
      .catch((err) => {
        console.error("Error saving bet:", err);
        alert("Error placing bet. Please try again.");
      });
  });
});