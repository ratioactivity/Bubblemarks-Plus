window.addEventListener("DOMContentLoaded", () => {
  const widgetColumn = document.getElementById("right-widgets");
  const petWidget = document.getElementById("pet-widget");

  if (!widgetColumn && !petWidget) {
    console.error("[PetWidget] #right-widgets not found");
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
      const template = document.createElement("template");
      template.innerHTML = html.trim();
      const widget = template.content.firstElementChild;

      if (!widget) {
        throw new Error("[PetWidget] No widget markup found in response");
      }

      widget.classList.add("bm-widget");

      if (widgetColumn) {
        const existingWidget = widgetColumn.querySelector("#pet-widget");
        if (existingWidget) {
          existingWidget.replaceWith(widget);
        } else {
          widgetColumn.appendChild(widget);
        }
      } else {
        petWidget?.replaceWith(widget);
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      console.log("✅ script validated");
    });
});
