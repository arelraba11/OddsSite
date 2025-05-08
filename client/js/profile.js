// ===== Profile Page Logic =====
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // Redirect to home page if no token is found
  if (!token) {
    return (window.location.href = "/");
  }

  // Decode the JWT to extract user information
  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token format:", err);
    return (window.location.href = "/");
  }

  const { id: userId, username, role } = payload;

  // Display username and role on the page
  document.getElementById("username-display").textContent = username;
  document.getElementById("role-display").textContent = role;

  // Fetch full user details (email and current points)
  fetch("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(user => {
      document.getElementById("email-display").textContent = user.email;
      document.getElementById("points-display").textContent = user.points;

      if (role === "admin") {
        // If user is admin, show admin dashboard and load all bets
        document.getElementById("admin-dashboard").classList.remove("hidden");
        loadAdminBets(token);
      } else {
        // If regular user, show their own bets
        document.getElementById("user-bets-section").classList.remove("hidden");
        loadUserBets(userId, token);
      }
    })
    .catch(err => {
      console.error("Failed to load profile info:", err);
      window.location.href = "/";
    });
});

// ===== Load Bets for Regular User =====
function loadUserBets(userId, token) {
  fetch("/api/bets/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch user bets");
      return res.json();
    })
    .then(bets => {
      const container = document.getElementById("user-bets-container");
      container.innerHTML = "";

      if (!bets.length) {
        container.innerHTML = "<p>No recent bets found.</p>";
        return;
      }

      bets.forEach(bet => {
        const betCard = document.createElement("div");
        betCard.className = "bet-card";

        const selections = bet.selections.map(sel =>
          `<li>${sel.home} vs ${sel.away} — Pick: <strong>${sel.pick}</strong> @ ${sel.odd}</li>`
        ).join("");

        betCard.innerHTML = `
          <div class="bet-meta">
            <strong>Stake:</strong> ${bet.stake} pts |
            <strong>Odds:</strong> ${bet.totalOdds} |
            <strong>Win:</strong> ${bet.potentialWin} pts
          </div>
          <ul>${selections}</ul>
          <div class="bet-date">Date: ${new Date(bet.createdAt).toLocaleString()}</div>
        `;

        container.appendChild(betCard);
      });
    })
    .catch(err => {
      console.error("Error loading user bets:", err);
      document.getElementById("user-bets-container").textContent = "Could not load your bets.";
    });
}

// ===== Load All Bets for Admin =====
function loadAdminBets(token) {
  fetch("/api/bets/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch all bets");
      return res.json();
    })
    .then(grouped => {
      const adminContainer = document.getElementById("admin-bets-container");
      adminContainer.innerHTML = "";

      Object.values(grouped).forEach(user => {
        const userBlock = document.createElement("div");
        userBlock.className = "admin-user-block";

        const userHeader = document.createElement("h3");
        userHeader.textContent = `${user.username} (${user.email})`;
        userBlock.appendChild(userHeader);

        user.bets.forEach(bet => {
          const betEntry = document.createElement("div");
          betEntry.className = "bet-entry";

          const selections = bet.selections.map(sel =>
            `${sel.home} vs ${sel.away} — Pick: ${sel.pick} @ ${sel.odd}`
          ).join("<br>");

          betEntry.innerHTML = `
            <p><strong>Stake:</strong> ${bet.stake} pts |
               <strong>Odds:</strong> ${bet.totalOdds} |
               <strong>Win:</strong> ${bet.potentialWin}</p>
            <p>${selections}</p>
            <small>${new Date(bet.createdAt).toLocaleString()}</small>
          `;

          userBlock.appendChild(betEntry);
        });

        adminContainer.appendChild(userBlock);
      });
    })
    .catch(err => {
      console.error("Error loading admin bets:", err);
    });
}