document.addEventListener("DOMContentLoaded", () => {
  // === Grab HTML elements ===
  const registerBtn = document.getElementById("register-btn");
  const loginBtn = document.getElementById("login-btn");
  const registerForm = document.getElementById("register-form");
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

  // === Toggle to registration form ===
  registerBtn.addEventListener("click", () => {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    registerBtn.classList.add("active");
    loginBtn.classList.remove("active");
    clearError();
  });

  // === Toggle to login form ===
  loginBtn.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginBtn.classList.add("active");
    registerBtn.classList.remove("active");
    clearError();
  });

  // === Handle registration form submit ===
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const username = registerForm.username.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/sports";
      } else {
        showError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Register error:", err);
      showError("Error registering user.");
    }
  });

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