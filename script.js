// script.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("orderForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = form.fullName.value;
    const phone = form.phone.value;
    const email = form.email.value;
    const notes = form.notes.value;
    const paymentStatus = form.paymentStatus.value;
    const receiptFile = document.getElementById("paymentProof").files[0];

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
      // Show success popup
      alert("✅ Your order was submitted successfully!");

      // Optional: also show message on page
      document.getElementById("checkoutNotice").textContent = "✅ Order submitted!";

      // Reset the form
      form.reset();
    }).catch((error) => {
      console.error("Error saving order:", error);
