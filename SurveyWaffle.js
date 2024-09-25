function SurveyWaffle() {
    this.name = 'Digital Child Safety Survey Waffle Chart';
    this.id = 'survey-waffle';
    this.loaded = false;
    this.dropdownMenu = null; 
    this.waffles = [];
    var responseOptions = {
        "Parental Perceived Effectiveness": ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        "Parental Comfort Level": ['Extremely Comfortable', 'Somewhat Comfortable', 'Neither Comfortable nor Uncomfortable', 'Somewhat Uncomfortable', 'Extremely Uncomfortable'],
        "Parental Concern About Privacy": ['Not Concerned at All', 'Slightly Concerned', 'Somewhat Concerned', 'Moderately Concerned', 'Extremely Concerned'],
        "Teacher's Perceived Effectiveness": ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
        "Teacher's Comfort Level": ['Extremely Comfortable', 'Somewhat Comfortable', 'Neither Comfortable nor Uncomfortable', 'Somewhat Uncomfortable', 'Extremely Uncomfortable'],
        "Teacher's Concern About Privacy": ['Not Concerned at All', 'Slightly Concerned', 'Somewhat Concerned', 'Moderately Concerned', 'Extremely Concerned']
    };
        // Mapping of column headings to tooltip text
    var tooltipTextMap = {
        "Parental Perceived Effectiveness": "Does digital monitoring enhance child safety in childcare?",
        "Parental Comfort Level": "Are you comfortable with your child being digitally monitored?",
        "Parental Concern About Privacy": "What's the level of your privacy concern with digital childcare monitoring?",
        "Teacher's Perceived Effectiveness": "Does digital monitoring enhance child safety in childcare?",
        "Teacher's Comfort Level": "Are you comfortable with digital monitoring of children in childcare?",
        "Teacher's Concern About Privacy": "What's the level of your privacy concern with digital childcare monitoring?"
    };


    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/survey-child-safety/Survey_Responses_Child_Safety_Monitoring_Systems_Expanded.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
                console.log("Data loaded successfully:");
                console.log(table); 
            },
            function(error) {
                console.log("Error loading data:");
                console.error(error);
            }
        );
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        console.log('Setup function is executed');
        var self = this; // Capture the correct context of `this`

        // Define the size of each waffle chart
        var waffleWidth = 170;
        var waffleHeight = 170;
        var waffleSpacing = 90;
        var xOffset = 50;
        var yOffset = 130;
        var responses = ["Parental Perceived Effectiveness", "Parental Comfort Level", "Parental Concern About Privacy", "Teacher's Perceived Effectiveness", "Teacher's Comfort Level", "Teacher's Concern About Privacy"];

        for (var i = 0; i < responses.length; i++) {
            var columnHeading = responses[i];
            var specificResponseOptions = responseOptions[columnHeading];

            // Calculate the x and y position for each waffle chart
            var xPos = xOffset + ((i % 3) * (waffleWidth + waffleSpacing)); // Adjust xPos for each waffle chart
            var yPos = yOffset +(Math.floor(i / 3) * (waffleHeight + waffleSpacing)); // Adjust yPos for each row

            this.waffles.push(new Waffle(xPos, yPos, waffleWidth, waffleHeight, 15, 15, this.data, columnHeading, specificResponseOptions));
            this.waffles[this.waffles.length - 1].tooltipText = tooltipTextMap[columnHeading]; // Assign tooltip text

        }
         // Create buttons for each waffle
         this.waffles.forEach((waffle, index) => {
            waffle.createHideShowButton(index);
            waffle.createPercentageButton(index);
         });

         // Create and position the dropdown menu
        this.dropdownMenu = createSelect();
        this.dropdownMenu.elt.setAttribute('id', 'surveyDropdown');
        this.dropdownMenu.elt.setAttribute('name', 'surveyDropdown');
        this.dropdownMenu.position(width, 30); // Adjust the position as needed
        this.dropdownMenu.option('All Categories');
        Object.keys(responseOptions).forEach(category => {
            this.dropdownMenu.option(category);
        });

        // When defining event handlers or callbacks, use `self` to refer to the SurveyWaffle instance
        this.dropdownMenu.changed(() => {
            const selectedCategory = self.dropdownMenu.value(); // Use `self` instead of `this`
            self.filterByCategory(selectedCategory); // Use `self` to ensure correct context
        });
    };

    this.filterByCategory = function(selectedCategory) {

        this.waffles.forEach(waffle => {
            console.log('Waffle category:', waffle.columnHeading);
    
            if (selectedCategory === 'All Categories' || waffle.columnHeading === selectedCategory) {
                waffle.isVisible = true;
            } else {
                waffle.isVisible = false;
            }
        });
    
        // Redraw the canvas to reflect the changes
        this.draw();

        noLoop();
    };
    
this.draw = function() {
    if (!this.loaded) {
         console.log('Data not yet loaded');
         return;
     }
     console.log('Draw function is executed'); 
     background(255);

      // Draw the main title
      push(); 
      fill(0);
      noStroke();
      textSize(24);
      textAlign(CENTER, TOP);
      text("Digital Safety Survey", 60 + width / 3, 20); 
      pop(); 

     for (var i = 0; i < this.waffles.length; i++) {
        this.waffles[i].draw();
         this.waffles[i].checkMouse(mouseX, mouseY);
     }
    // Draw the legend
     this.drawLegend();
    };

    this.drawLegend = function() {

        var legendX = 785; // Adjust as needed
        var legendY = 80; // Starting Y position of the legend
        var boxSize = 10; // Size of the color box
        var textOffset = 10; // Offset for the text from the color box
        var lineSpacing = 25; // Space between each line in the legend
    
        textSize(12);
        noStroke();
        textAlign(LEFT, CENTER);
    
        // Iterate through each category and its colors
        var categories = ["Perceived Effectiveness", "Comfort Level", "Concern About Privacy"];
        categories.forEach(function(category) {
            fill(0);
            text(category, legendX, legendY);
            legendY += lineSpacing;
    
            var colours = colourPalettes[category];
            var responses = responseOptions['Parental ' + category];
    
            // Draw color boxes and text for each response
            for (var i = 0; i < colours.length; i++) {
                fill(colours[i]);
                rect(legendX, legendY, boxSize, boxSize);
    
                fill(0);
                text(responses[i], legendX + boxSize + textOffset, legendY + boxSize / 2);
                legendY += lineSpacing;
            }
    
            legendY += lineSpacing; // Extra spacing between categories
        });
    };

    this.destroy = function() {
        // Loop through all waffles and call removeButtons
        this.waffles.forEach(waffle => {
            waffle.removeButtons();
        });

         // Remove the dropdown menu if it exists
        if (this.dropdownMenu) {
            this.dropdownMenu.remove();
            this.dropdownMenu = null; // Reset the property to ensure it's fully cleaned up
        }
        this.waffles = [];
        clear(); 
    };
 };

 




