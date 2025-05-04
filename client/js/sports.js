// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // ======== AUTH CHECK & USER DISPLAY ========
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "/");

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload?.username || "User";
    document.getElementById("username-display").textContent = username;
  } catch (err) {
    console.error("Invalid token:", err);
    return (window.location.href = "/");
  }

  // ======== DOM ELEMENTS ========
  const sportsContainer = document.getElementById("sports-container");
  const slipContainer = document.getElementById("bet-slip");
  const totalOddsDisplay = document.getElementById("total-odds-display");
  const pointsInput = document.getElementById("stake-input");
  const winDisplay = document.getElementById("potential-return");
  const submitBtn = document.getElementById("submit-bets-btn");
  const profileBtn = document.getElementById("go-to-profile-btn");
  const userBets = [];

  // ======== NAVIGATION ========
  profileBtn?.addEventListener("click", () => {
    window.location.href = "/profile";
  });

  // ======== FILTER BUTTONS ========
  document.querySelectorAll(".sport-filters button").forEach(btn => {
    btn.addEventListener("click", () => {
      const sport = btn.dataset.sport;
      if (sport === "all") {
        loadAllMatches();
      } else {
        loadMatchesBySport(sport);
      }
    });
  });

  // ======== HANDLE MATCH DISPLAY ========
  function renderMatches(matches) {
    sportsContainer.innerHTML = "";

    if (!Array.isArray(matches) || matches.length === 0) {
      sportsContainer.innerHTML = "<p>No matches found.</p>";
      return;
    }

    matches.forEach((match) => {
      const outcomes = match.bookmakers?.[0]?.markets?.find(m => m.key === "h2h")?.outcomes;
      if (!outcomes) return;

      const card = document.createElement("div");
      card.className = "sport-card";
      card.innerHTML = `
        <div class="match-header">${match.home_team} vs ${match.away_team}</div>
        <div class="match-time">Kickoff: ${new Date(match.commence_time).toLocaleString()}</div>
        <div class="odds-options">
          ${outcomes.map(o => `
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
      sportsContainer.appendChild(card);
    });
  }

  // ======== BET SLIP SELECTION ========
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("bet-option")) return;

    const { match, home, away, pick, odd } = e.target.dataset;

    if (userBets.some(b => b.match === match && b.pick === pick)) {
      alert("This selection is already in your bet slip.");
      return;
    }

    userBets.push({ match, home, away, pick, odd: parseFloat(odd) });
    renderBetSlip();
  });

  // ======== RENDER BET SLIP & CALCULATIONS ========
  function renderBetSlip() {
    slipContainer.innerHTML = userBets.map(b => `
      <div class="bet-entry">
        <p>${b.home} vs ${b.away}</p>
        <p>Pick: <strong>${b.pick}</strong> @ ${b.odd}</p>
      </div>
    `).join("");

    const total = userBets.reduce((acc, b) => acc * b.odd, 1);
    totalOddsDisplay.textContent = `Total Odds: ${total.toFixed(2)}`;

    const stake = parseFloat(pointsInput.value);
    winDisplay.textContent = !isNaN(stake)
      ? `Potential Return: ${(stake * total).toFixed(2)}`
      : "";
  }

  // ======== STAKE INPUT CHANGE ========
  pointsInput.addEventListener("input", renderBetSlip);

  // ======== SUBMIT BET ========
  submitBtn?.addEventListener("click", () => {
    if (userBets.length === 0) {
      alert("No bets selected.");
      return;
    }

    const stake = parseFloat(pointsInput.value);
    if (isNaN(stake) || stake <= 0) {
      alert("Please enter a valid amount of points.");
      return;
    }

    const total = userBets.reduce((acc, b) => acc * b.odd, 1);

    const payload = {
      bets: userBets.map(b => ({
        matchId: b.match,
        home: b.home,
        away: b.away,
        pick: b.pick,
        odd: b.odd
      })),
      stake,
      totalOdds: total.toFixed(2),
      potentialWin: (stake * total).toFixed(2)
    };

    fetch("/api/bets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then((data) => {
        if (data.bet?._id) {
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

  // ======== HELPER FUNCTIONS ========
  function loadAllMatches() {
    fetch("/api/odds/sports")
      .then(res => res.json())
      .then(renderMatches)
      .catch(err => {
        console.error("Load all error:", err);
      });
  }

  function loadMatchesBySport(sportKey) {
    fetch("/api/odds/sports")
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter(match => match.sport_key === sportKey);
        renderMatches(filtered);
      })
      .catch(err => {
        console.error("Filter error:", err);
      });
  }
});