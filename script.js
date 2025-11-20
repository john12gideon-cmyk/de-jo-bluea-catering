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
