// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  
  // Attach click event to the "Load Odds" button
  document.getElementById("load-odds-btn").addEventListener("click", () => {
    console.log("Fetching Champions League odds...");

    // Fetch data from backend API
    fetch("/api/odds/sports")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Odds data:", data);

        // Target the container for displaying matches
        const container = document.getElementById("sports-container");
        container.innerHTML = ""; // Clear previous content

        // Handle invalid or empty response
        if (!Array.isArray(data)) {
          container.innerHTML = "No odds available.";
          return;
        }

        // Iterate through each match and render it
        data.forEach((match) => {
          const bookmaker = match.bookmakers?.[0];
          const market = bookmaker?.markets?.find((m) => m.key === "h2h");
          const outcomes = market?.outcomes;

          if (!outcomes) return; // Skip if no odds

          // Create container for a single match
          const div = document.createElement("div");
          div.className = "sport";

          // Inject HTML structure with match and odds info
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
});