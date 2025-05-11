document.addEventListener("DOMContentLoaded", () => {
  // === Grab HTML elements ===
  const loginForm = document.getElementById("login-form");
  const errorBox = document.getElementById("error-message");

  // === Utility: Show an error message ===
  const showError = (message) => {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
  };

  // === Utility: Clear error message ===
  const clearError = () => {
    errorBox.textContent = "";
    errorBox.classList.add("hidden");
  };

  // === Handle login form submit ===
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/sports";
      } else {
        showError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      showError("Error logging in.");
    }
  });
});