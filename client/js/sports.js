// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check for token in localStorage
  const token = localStorage.getItem("token");

  // If no token, redirect to login page
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Decode token to extract username
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const username = payload?.username || "User";

    // Display username in the greeting
    const userDisplay = document.getElementById("username-display");
    if (userDisplay) userDisplay.textContent = username;
  } catch (err) {
    console.error("Invalid token:", err);
    window.location.href = "/";
  }

  // Attach click event to "Load Odds" button
  const loadOddsBtn = document.getElementById("load-odds-btn");
  if (loadOddsBtn) {
    loadOddsBtn.addEventListener("click", () => {
      console.log("Fetching Champions League odds...");

      fetch("/api/odds/sports")
        .then((res) => {
          if (!res.ok) throw new Error("Network response was not ok");
          return res.json();
        })
        .then((data) => {
          console.log("Odds data:", data);

          const container = document.getElementById("sports-container");
          container.innerHTML = ""; // Clear old content

          if (!Array.isArray(data)) {
            container.innerHTML = "No odds available.";
            return;
          }

          data.forEach((match) => {
            const bookmaker = match.bookmakers?.[0];
            const market = bookmaker?.markets?.find((m) => m.key === "h2h");
            const outcomes = market?.outcomes;

            if (!outcomes) return;

            const div = document.createElement("div");
            div.className = "sport";

            div.innerHTML = `
              <div class="match-teams">
                <strong>${match.home_team}</strong> vs <strong>${match.away_team}</strong>
              </div>
              <div class="match-time">
                Kickoff: ${new Date(match.commence_time).toLocaleString()}
              </div>
              <div class="odds">
                <ul>
                  ${outcomes.map((o) => `<li>${o.name}: <strong>${o.price}</strong></li>`).join("")}
                </ul>
              </div>
            `;

            container.appendChild(div);
          });
        })
        .catch((err) => {
          console.error("Error fetching odds:", err);
          document.getElementById("sports-container").innerText = "Failed to load odds.";
        });
    });
  }
});