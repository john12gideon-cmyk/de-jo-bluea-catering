document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");

  // ===== ORDER FORM SUBMISSION =====
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = form.fullName.value;
    const phone = form.phone.value;
    const email = form.email.value;
    const notes = form.notes.value;
    const paymentStatus = form.paymentStatus.value;
    const receiptFile = document.getElementById("paymentProof")?.files[0];

    if (!name || !phone || !email || !paymentStatus) {
      alert("Please fill out all required fields.");
      return;
    }

    // Save to Firebase Firestore
    db.collection("orders").add({
      name,
      phone,
      email,
      notes,
      paymentStatus,
      createdAt: new Date()
    }).then(() => {
      alert("✅ Your order was submitted successfully!");
      document.getElementById("checkoutNotice").textContent = "✅ Order submitted!";
      form.reset();
    }).catch((error) => {
      console.error("Error saving order:", error);
      alert("❌ Something went wrong. Try again.");
    });
  });

  // ===== RATING SYSTEM =====
  let selectedRating = 0;

  // Star click logic
  document.querySelectorAll("#ratingSection .stars span").forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = star.getAttribute("data-value");
      document.querySelectorAll("#ratingSection .stars span").forEach(s => s.classList.remove("active"));
      for (let i = 1; i <= selectedRating; i++) {
        document.querySelector(`#ratingSection .stars span[data-value="${i}"]`).classList.add("active");
      }
    });
  });

  // Submit rating
  document.getElementById("submitRating")?.addEventListener("click", () => {
    const feedback = document.getElementById("feedbackText").value;
    const name = form.fullName.value;
    const email = form.email.value;
    const phone = form.phone.value;

    if (!selectedRating) {
      alert("Please select a star rating.");
      return;
    }

    db.collection("ratings").add({
      rating: Number(selectedRating),
      feedback,
      customer: { name, email, phone },
      createdAt: new Date()
    }).then(() => {
      document.getElementById("ratingNotice").textContent = "✅ Thank you for your feedback!";
      document.getElementById("feedbackText").value = "";
      selectedRating = 0;
      document.querySelectorAll("#ratingSection .stars span").forEach(s => s.classList.remove("active"));
    }).catch(err => {
      console.error("Error saving rating:", err);
      alert("❌ Could not save rating. Try again.");
