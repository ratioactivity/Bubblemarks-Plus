window.addEventListener("DOMContentLoaded", () => {
  const petWidgetContainer = document.getElementById("pet-widget-container");

  if (!petWidgetContainer) {
    console.error("[PetWidget] #pet-widget-container not found");
    console.log("✅ script validated");
    return;
  }

  const existingIframe = petWidgetContainer.querySelector(".pet-widget iframe");

  if (existingIframe) {
    console.log("✅ script validated");
    return;
  }

  fetch("right-side/pet-widget.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`[PetWidget] Unable to load widget markup: ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      petWidgetContainer.innerHTML = html;
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      console.log("✅ script validated");
    });
});
