// ===== Profile Page Logic =====
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "/");

  // Decode JWT to extract user data
  let payload;
  try {
    payload = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token format:", err);
    return (window.location.href = "/");
  }

  const { id: userId, username, role } = payload;

  // Update UI with user info
  document.getElementById("username-display").textContent = username;
  document.getElementById("role-display").textContent = role;

  // Fetch full user data (email, points)
  fetch("/api/auth/me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then(user => {
      document.getElementById("email-display").textContent = user.email;
      document.getElementById("points-display").textContent = user.points;

      if (role === "admin") {
        document.getElementById("admin-dashboard").classList.remove("hidden");
        loadAdminBets(token);
        setupCreateUserForm(token);
      } else {
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
    headers: { Authorization: `Bearer ${token}` },
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

// ===== Load All Bets of Admin's Managed Users =====
function loadAdminBets(token) {
  fetch("/api/admin/bets", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch bets");
      return res.json();
    })
    .then(grouped => {
      const adminContainer = document.getElementById("admin-user-bets");
      adminContainer.innerHTML = "";

      if (!Object.keys(grouped).length) {
        adminContainer.innerHTML = "<p>No bets found for your users.</p>";
        return;
      }

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

// ===== Admin: Handle New User Creation =====
function setupCreateUserForm(token) {
  const form = document.getElementById("create-user-form");
  const msg = document.getElementById("create-user-msg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.classList.add("hidden");

    const username = document.getElementById("new-username").value.trim();
    const email = document.getElementById("new-email").value.trim();
    const password = document.getElementById("new-password").value;
    const points = parseInt(document.getElementById("initial-points").value);

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, points })
      });

      const data = await res.json();

      if (res.ok) {
        msg.textContent = "User created successfully.";
        msg.classList.remove("hidden");
        msg.style.color = "lightgreen";
        form.reset();
        loadAdminBets(token); // Refresh the list
      } else {
        msg.textContent = data.message || "Failed to create user.";
        msg.classList.remove("hidden");
        msg.style.color = "orange";
      }
    } catch (err) {
      console.error("Error creating user:", err);
      msg.textContent = "Server error.";
      msg.classList.remove("hidden");
      msg.style.color = "red";
    }
  });
}