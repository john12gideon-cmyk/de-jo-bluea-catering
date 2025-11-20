// script.js

// Listen for form submission
document.querySelector(".btn.primary").addEventListener("click", function(e) {
  e.preventDefault();

  // Get payment status from the dropdown
  const paymentStatus = document.querySelector("select[name='paymentStatus']").value;

  // Optional: Get uploaded file name (if needed later)
  const receiptFile = document.getElementById("paymentProof").files[0];

  // Save to Firebase Firestore
  db.collection("payments").add({
    status: paymentStatus,
    timestamp: new Date()
  }).then(() => {
    document.getElementById("checkoutNotice").textContent = "✅ Payment status saved!";
  }).catch((error) => {
    console.error("❌ Error saving payment:", error);
    alert("Something went wrong. Try again.");
  });
});

document.getElementById("orderForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = e.target.fullName.value;
  const phone = e.target.phone.value;
  const email = e.target.email.value;
  const notes = e.target.notes.value;
  const paymentStatus = e.target.paymentStatus.value;
  const receiptFile = document.getElementById("paymentProof").files[0];

  if (!name || !phone || !email || !paymentStatus) {
    alert("Please fill out all required fields.");
    return;
  }

  db.collection("orders").add({
    name,
    phone,
    email,
    notes,
    paymentStatus,
    createdAt: new Date()
  }).then(() => {
    document.getElementById("checkoutNotice").textContent = "✅ Order submitted!";
    e.target.reset();
  }).catch((error) => {
    console.error("Error saving order:", error);
    alert("Something went wrong.");
  });
});
