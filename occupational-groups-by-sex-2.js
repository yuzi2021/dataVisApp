function OccupationalGroupsSex2() {

    // Name for the visualization to appear in the menu bar.
    this.name = 'Occupational Groups: Sex 2';
  
    // Each visualization must have a unique ID with no special characters.
    this.id = 'occupational-groups-sex-2'  
    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
      // Locations of margin positions. Left and bottom have double margin
      // size due to axis and tick labels.
      leftMargin: 130,
      rightMargin: width,
      topMargin: 30,
      bottomMargin: height,
      pad: 5,
  
      plotWidth: function() {
        return this.rightMargin - this.leftMargin;
      },
  
      // Boolean to enable/disable background grid.
      grid: true,
  
      // Number of axis tick labels to draw so that they are not drawn on
      // top of one another.
      numXTickLabels: 10,
      numYTickLabels: 8,
    };
  
    // Middle of the plot: for the 50% line.
    this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;
  
    // Default visualization colors.
    this.femaleColour = color(255, 0, 0);
    this.maleColour = color(0, 255, 0);
  
    // Property to represent whether data has been loaded.
    this.loaded = false;
  
    // Preload the data. This function is called automatically by the
    // gallery when a visualization is added.
    this.preload = function() {
      var self = this;
      this.data = loadTable(
        './data/tech-diversity/occupational-groups-by-sex-2.csv', 'csv', 'header',
        // Callback function to set the value
        // this.loaded to true.
        function(table) {
          self.loaded = true;
        });
  
    };
  
    this.setup = function() {
      // Font defaults.
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
  
      // Draw Female/Male labels at the top of the plot.
      this.drawCategoryLabels();
  
      var lineHeight = (height - this.layout.topMargin) /
        this.data.getRowCount();
  
      for (var i = 0; i < this.data.getRowCount(); i++) {
  
        // Calculate the y position for each occupation.
        var lineY = (lineHeight * i) + this.layout.topMargin;
  
        // Create an object that stores data from the current row.
        var area = {
          // Convert strings to numbers.
          'occupation': this.data.getString(i, 'occupation'),
          'female': this.data.getNum(i, 'female'),
          'male': this.data.getNum(i, 'male'),
        };
  
        // Calculate the width of the bars for female and male employees.
        var femaleWidth = this.mapPercentToWidth(area.female);
        var maleWidth = this.mapPercentToWidth(area.male);
  
        // Calculate the starting x-coordinate for each bar with a margin.
        var femaleX = this.layout.leftMargin;
        var maleX = femaleX + femaleWidth;
  
        // Draw the occupation name in the left margin.
        fill(0);
        noStroke();
        textAlign('right', 'top');
        var textX = this.layout.leftMargin;
        text(area.occupation, textX, lineY);
  
        // Draw female employees rectangle.
        fill(this.femaleColour);
        rect(femaleX, lineY, femaleWidth, lineHeight - this.layout.pad);
  
        // Draw male employees rectangle.
        fill(this.maleColour);
        rect(maleX, lineY, maleWidth, lineHeight - this.layout.pad);
      }
  
      // Draw the 50% line.
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
      text('Male', this.layout.rightMargin, this.layout.pad);
    };
  
    this.mapPercentToWidth = function(percent) {
      return map(percent, 0, 100, 0, this.layout.plotWidth());
    };
  }
  