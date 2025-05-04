// Run after DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Redirect to homepage if token is missing
  if (!token) {
    return (window.location.href = "/");
  }

  // Decode JWT token to extract user data
  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token:", err);
    return (window.location.href = "/");
  }

  const userId = payload.id;
  const username = payload.username;
  const role = payload.role;

  // Display username and role
  document.getElementById("username-display").textContent = username;
  document.getElementById("role-display").textContent = role;

  // Load additional user info (email, points)
  fetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => {
      document.getElementById("email-display").textContent = data.email;
      document.getElementById("points-display").textContent = data.points;

      if (role === "admin") {
        // Show admin section
        document.getElementById("admin-dashboard").classList.remove("hidden");
        loadAllBetsForAdmin(token);
      } else {
        // Show user section
        document.getElementById("user-bets-section").classList.remove("hidden");
        loadUserBets(userId, token);
      }
    })
    .catch((err) => {
      console.error("Failed to load profile:", err);
      window.location.href = "/";
    });
});

// ========== Load bets for regular user ==========
function loadUserBets(userId, token) {
  fetch("/api/bets/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch bets");
      return res.json();
    })
    .then((bets) => {
      const container = document.getElementById("user-bets-container");

      if (!bets.length) {
        container.innerHTML = "<p>No recent bets found.</p>";
        return;
      }

      bets.forEach((bet) => {
        const div = document.createElement("div");
        div.className = "bet-card";

        const selections = bet.selections.map(sel => `
          <li>${sel.home} vs ${sel.away} — Pick: <strong>${sel.pick}</strong> @ ${sel.odd}</li>
        `).join("");

        div.innerHTML = `
          <div class="bet-meta">
            <strong>Stake:</strong> ${bet.stake} pts |
            <strong>Odds:</strong> ${bet.totalOdds} |
            <strong>Win:</strong> ${bet.potentialWin} pts
          </div>
          <ul>${selections}</ul>
          <div class="bet-date">Date: ${new Date(bet.createdAt).toLocaleString()}</div>
        `;
        container.appendChild(div);
      });
    })
    .catch((err) => {
      console.error("Error loading bets:", err);
      document.getElementById("user-bets-container").innerText = "Could not load your bets.";
    });
}

// ========== Load all bets for admin view ==========
function loadAllBetsForAdmin(token) {
  fetch("/api/bets/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((grouped) => {
      const adminSection = document.getElementById("admin-dashboard");
      adminSection.innerHTML = "";

      Object.values(grouped).forEach(userGroup => {
        const userDiv = document.createElement("div");
        userDiv.classList.add("admin-user-group");

        const title = document.createElement("h3");
        title.textContent = `${userGroup.username} (${userGroup.email})`;
        userDiv.appendChild(title);

        userGroup.bets.forEach(bet => {
          const betDiv = document.createElement("div");
          betDiv.classList.add("bet-entry");

          betDiv.innerHTML = `
            <p><strong>Stake:</strong> ${bet.stake} pts |
               <strong>Odds:</strong> ${bet.totalOdds} |
               <strong>Win:</strong> ${bet.potentialWin}</p>
            <p>${bet.selections.map(sel =>
              `${sel.home} vs ${sel.away} — Pick: ${sel.pick} @ ${sel.odd}`
            ).join("<br>")}</p>
            <small>${new Date(bet.createdAt).toLocaleString()}</small>
          `;

          userDiv.appendChild(betDiv);
        });

        adminSection.appendChild(userDiv);
      });
    })
    .catch((err) => {
      console.error("Error loading all bets for admin:", err);
    });
}