function OccupationalGroupsSex() {
  // Name for the visualization to appear in the menu bar.
  this.name = 'Occupational Groups: Sex';

  // Each visualization must have a unique ID with no special characters.
  this.id = 'occupational-groups-sex';

  // Layout object to store all common plot layout parameters and methods.
  this.layout = {
    leftMargin: 130,
    rightMargin: width,
    topMargin: 30,
    bottomMargin: height,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    grid: true,

    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Default visualisation colours.
  this.femaleColour = color(255, 0, 0);
  this.maleColour = color(0, 255, 0);

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/occupational-groups-by-sex-2.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    textSize(16);
  };

  this.destroy = function() {
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    background(255);
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);

    var occupation = this.data.getString(0, 'occupation');
    text(occupation, width / 2, height / 2);

    this.drawCategoryLabels();

    var lineHeight = (height - this.layout.topMargin) / this.data.getRowCount();

    var totalWidths = 0;
    var margin = 60;

    var maxRightEdge = this.layout.leftMargin;

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var lineY = (lineHeight * i) + this.layout.topMargin;

      var area = {
        'occupation': this.data.getString(i, 'occupation'),
        'female': this.data.getNum(i, 'female'),
        'male': this.data.getNum(i, 'male'),
      };
      
      var femaleWidth = this.mapPercentToWidth(area.female) -margin;
      var maleWidth = this.mapPercentToWidth(area.male) - margin;

      totalWidths += femaleWidth + maleWidth;

      fill(this.femaleColour);
      rect(this.layout.leftMargin, lineY, femaleWidth, lineHeight - this.layout.pad);

      fill(this.maleColour);
      rect(this.layout.leftMargin + femaleWidth, lineY, maleWidth, lineHeight - this.layout.pad);

      // Update maxRightEdge if this row's right edge is greater
      var currentRightEdge = this.layout.leftMargin + femaleWidth + maleWidth;
      if (currentRightEdge > maxRightEdge) {
        maxRightEdge = currentRightEdge;
      }

      fill(0);
      noStroke();
      textAlign('left', 'top');
      text(area.occupation, maxRightEdge, lineY);

    }  
    // Store the maxRightEdge for use in drawCategoryLabels
    this.maxBarChartRightEdge = maxRightEdge;

    var averageBarWidth = totalWidths / this.data.getRowCount();
    this.midX = this.layout.leftMargin + (averageBarWidth / 2);

    stroke(150);
    strokeWeight(1);
    line(this.midX, this.layout.topMargin, this.midX, this.layout.bottomMargin);
  };

  this.drawCategoryLabels = function() {
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text('Female', this.layout.leftMargin, this.layout.pad);
    textAlign('center', 'top');
    text('50%', this.midX, this.layout.pad);
    textAlign('right', 'top');
    text('Male', this.maxBarChartRightEdge, this.layout.pad);
  };

  this.mapPercentToWidth = function(percent) {
    return map(percent, 0, 100, 0, this.layout.plotWidth());
  };
}
