// Get interactive components
const dontGetItButton = document.getElementById("dontGetIt");
const getItCanvas = document.getElementById("dont-get-it-box");

dontGetItButton.addEventListener("click", function () {
  // toggle between display none and display felx
  getItCanvas.style.display = getItCanvas.style.display === "none" ? "flex" : "none";
});
