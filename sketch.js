function setup() {
  // Create a canvas to fill the content div from index.html.
  canvasContainer = select('#app');
  var c = createCanvas(1024, 576);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new EmploymentGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new OccupationalGroupsSex2());
  gallery.addVisual(new OccupationalGroupsSex());
  gallery.addVisual(new SurveyWaffle());
  gallery.addVisual(new BubbleChart());

}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}
