// Initializes a Waffle chart with specified parameters for positioning, size, data, and visualization options.
var colourPalettes = {
    "Perceived Effectiveness": ['#00429d', '#4771b2', '#73a2c6', '#a5d5d8', '#e8f1f2'], // Dark to light blue
    "Comfort Level": ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8'], // Dark to light purple
    "Concern About Privacy": ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b'] // Dark to light red
};

function Waffle(x, y, width, height, boxes_across, boxes_down, table, columnHeading, specificResponseOptions) {
       // Chart positioning and dimensions
    var self = this; // Reference to the Waffle chart instance for use in nested functions.
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.boxes_down = boxes_down;
    this.boxes_across = boxes_across;
    // Chart data and visualization configurations
    this.categories = []; 
    this.specificResponseOptions = specificResponseOptions; // Store the specific response options
    this.titleBorder = { x: 0, y: 0, w: 0, h: 0 };
    this.tooltipText = ""; 
    var boxes = [];
    this.columnHeading = columnHeading; 
    // Visibility and display options
    this.isVisible = true;
    this.showPercentages = false;

    // Method to populate the chart with categories based on the dataset and response options
    this.addCategories = function() {
        var column = table.getColumn(columnHeading);

        // Extract the latter part of the column heading for the main category
        var mainCategory = columnHeading.includes("Parental") ? 
                           columnHeading.split("Parental ")[1] : 
                           columnHeading.split("Teacher's ")[1];
        // Selects the colour palette based on the main category.
        var colourPalette = colourPalettes[mainCategory];

        if (!colourPalette) {
            console.error("Colour palette not found for main category:", mainCategory);
            return; // Skip this category if no matching colour palette is found
        }
        // Iterates through specific response options to calculate the count for each and populate the categories array.
        for (var i = 0; i < self.specificResponseOptions.length; i++) {
            var option = self.specificResponseOptions[i];
            var count = column.filter(response => response.trim() === option).length;
            // Adds the current category to the categories array with its associated data.
            self.categories.push({
                "name": option,
                "count": count,
                "colour": colourPalette[i],
                "category": columnHeading,
                "percentage": parseFloat(((count / column.length) * 100).toFixed(2)),
                "visible": true
            });
        }
        // Calculates the number of boxes to be filled for each category, rounding to the nearest whole number.
        for (var i = 0; i < self.categories.length; i++) {
            var totalResponses = column.length;
        // Calculates the proportion of boxes that should be filled for the category.
            self.categories[i].boxes = Math.round((self.categories[i].count / totalResponses) * (self.boxes_down * self.boxes_across));
        }
    };
    
    // This method is responsible for generating and positioning the individual boxes that comprise the waffle chart. Each box represents a portion of the dataset, with the arrangement and colouration reflecting the distribution of data across predefined categories.
    this.addBoxes = function() {
        var boxWidth = self.width / self.boxes_across;// Determines the width of each box based on the total width of the chart and the number of boxes across.
        var boxHeight = self.height / self.boxes_down;// Determines the height of each box based on the total height of the chart and the number of boxes down.
        var currentCategoryIndex = 0; // Tracks the current category being processed.
        var currentBoxCountForCategory = 0;// Tracks the number of boxes processed for the current category.
       
        // Iterates through each row and column within the chart's grid to place the boxes accordingly.
        for (var i = 0; i < self.boxes_down; i++) {
            boxes.push([]);
            for (var j = 0; j < self.boxes_across; j++) {
                // Checks if there are still categories left to process.
                if (currentCategoryIndex < self.categories.length) {
                    var category = self.categories[currentCategoryIndex];
                    boxes[i].push(new Box(self.x + (j * boxWidth), self.y + (i * boxHeight), boxWidth, boxHeight, category));
    
                    currentBoxCountForCategory++;
                    // Moves to the next category once the allocated number of boxes for the current category has been reached.
                    if (currentBoxCountForCategory >= category.boxes) {
                        currentCategoryIndex++;
                        currentBoxCountForCategory = 0;
                    }
                } else {
                    // Fills the remaining space with empty boxes if there are no more categories to process.
                    boxes[i].push(new Box(self.x + (j * boxWidth), self.y + (i * boxHeight), boxWidth, boxHeight, null));
                }
            }
        }
    };

    // Initialize the chart by calling the necessary setup methods
    this.addCategories();
    this.addBoxes();
    
    // Method to draw the waffle chart including its boxes, titles, and optionally, percentages and tooltips.
    this.draw = function() {
        if (this.isVisible) {
            // Draw the boxes and keep track of the boxes for each category
            var currentCategoryIndex = 0;
            var currentBoxCountForCategory = 0;
            var boxWidth = this.width / this.boxes_across;
            var boxHeight = this.height / this.boxes_down;
    
            for (var i = 0; i < this.boxes_down; i++) {
                for (var j = 0; j < this.boxes_across; j++) {
                    if (currentCategoryIndex < this.categories.length) {
                        var category = this.categories[currentCategoryIndex];
                        if (category.visible) { // Only draw if the category is visible
                            boxes[i][j].draw();
                            currentBoxCountForCategory++;
        
                            // When reaching the end of the current category, display the percentage
                            if (currentBoxCountForCategory >= category.boxes) {
                                currentCategoryIndex++;
                                currentBoxCountForCategory = 0;
                            }
                        }    
                    }
                }
            }
            
            // Method to add titles above the chart for context
            this.addTitles();
    
             // Tooltip logic
            if (mouseX > this.titleBorder.x && mouseX < this.titleBorder.x + this.titleBorder.w &&
            mouseY > this.titleBorder.y && mouseY < this.titleBorder.y + this.titleBorder.h) {
            // Calculate tooltip text width and adjust rectangle size
            textSize(12);
            var textW = textWidth(this.tooltipText);
            var tooltipWidth = textW + 20; // Add some padding
            var tooltipHeight = 50; // Fixed height

            // Display tooltip
            push();
            fill(0);
            stroke(0);
            rect(mouseX, mouseY, tooltipWidth, tooltipHeight/2);
            fill(255);
            text(this.tooltipText, mouseX + 10, mouseY + tooltipHeight / 3); // Adjust text position as needed
            pop();
            }   

            // Draw percentages after rendering all boxes to avoid overwriting
            if (this.showPercentages) {
                this.drawPercentages();
            }
        }
    };

    // Method to draw percentages on the chart.
    this.drawPercentages = function() {
        var boxWidth = this.width / this.boxes_across;
        var boxHeight = this.height / this.boxes_down;
        var rightEdgeCol = this.boxes_across - 1; // rightmost column
    
        var currentBoxIndex = 0;
        for (var category of this.categories) {
            // Calculate the middle row for the category
            var startRow = Math.floor(currentBoxIndex / this.boxes_across);
            var endRow = Math.floor((currentBoxIndex + category.boxes - 1) / this.boxes_across);
            var midRow = Math.floor((startRow + endRow) / 2);
    
            var x = this.x + rightEdgeCol * boxWidth //+ boxWidth / 2;
            var y = this.y + midRow * boxHeight + boxHeight / 2;
            // Set text background for readability
            fill(0, 100); // Semi-transparent black background
            rect(x - 10, y - 10, 20, 20); 
            
            fill(255); // Text color for percentage
            textSize(12); 
            textAlign(CENTER, CENTER);
            text(category.percentage + '%', x, y);
    
            currentBoxIndex += category.boxes;
        }
    };

    // Method to add titles above the chart. It calculates the position based on the chart dimensions and draws the title text.
    this.addTitles = function(){
        var titleText = columnHeading;
        textSize(15);
        var textW = textWidth(titleText);
        var textH = 20; // Approximate height of the text

        // Set title border dimensions
        this.titleBorder.x = this.x + this.width / 2 - textW / 2 - 5;
        this.titleBorder.y = this.y - 60 - textH / 2;
        this.titleBorder.w = textW + 10;
        this.titleBorder.h = textH + 10;

        push();
        fill(0);
        textAlign(CENTER, TOP);
        text(titleText, this.x + this.width / 2, this.y - 60);
        // Draw border
        noFill();
        stroke(0);
        rect(this.titleBorder.x, this.titleBorder.y, this.titleBorder.w, this.titleBorder.h);
        pop();
    };

    // Method to create a button for toggling the visibility of the chart
    this.createHideShowButton = function() {
        // Create a button with an eye icon to indicate visibility toggle
        this.hideShowButton = createButton('👁️');
        // Position the button relative to the chart's position
        this.hideShowButton.position(this.x + 300, this.y - 20);
        
        this.hideShowButton.mousePressed(() => {
          this.toggleVisibility();
        });
        // Set id and name for the button
        this.hideShowButton.elt.setAttribute('id', 'hideShowButton');
        this.hideShowButton.elt.setAttribute('name', 'hideShowButton');
      };

    // Method to toggle the visibility state of the chart
      this.toggleVisibility = function() {
        this.isVisible = !this.isVisible;
        this.draw();
    };

    // Method to create a button for toggling the display of percentages on the chart
    this.createPercentageButton = function() {
        // Create a button with a percent symbol to indicate toggling percentages
        this.percentageButton = createButton('%');
        // Position the button near the hide/show button for consistency
        this.percentageButton.position(this.x + 340, this.y - 20);
        // Define a mousePressed event for the button to toggle the display of percentages
        this.percentageButton.mousePressed(() => {
          this.togglePercentages();
        });
        // Set id and name for the button
        this.percentageButton.elt.setAttribute('id', 'percentageButton');
        this.percentageButton.elt.setAttribute('name', 'percentageButton');
      };

    // Method to toggle the display of percentages on the chart
    this.togglePercentages = function() {
        // Toggle the showPercentages flag
        this.showPercentages = !this.showPercentages;
        // Redraw the chart to reflect the updated state
        this.draw();
        };
      
    // Method to toggle the display of percentages on the chart
    this.removeButtons = function() {
        if (this.hideShowButton) {
            this.hideShowButton.remove();
            this.hideShowButton = null; // Clear reference
        }
        if (this.percentageButton) {
            this.percentageButton.remove();
            this.percentageButton = null; // Clear reference
        }
    };

    // Checks if the mouse is hovering over any of the chart's boxes to display tooltips with additional information.
    this.checkMouse = function(mouseX, mouseY){
    // Iterate through all rows of boxes
        for(var i = 0; i < boxes.length; i++){
            // Iterate through each box in the current row
            for (var j = 0; j < boxes[i].length; j++){
            // Ensure the current box is associated with a category before proceeding
                if (boxes[i][j].category !== undefined){
                    // Check if the mouse is currently over this box
                    var mouseOver = boxes[i][j].mouseOver(mouseX, mouseY);
                    // If `mouseOver` returns a truthy value, it means the mouse is over a box that should display a tooltip
                    if(mouseOver !== false){
                        push();// Start a new drawing state
                        fill(0);// Set the fill color for the tooltip background to black for readability
                        textSize(10);// Set the tooltip text size
                        var tWidth = textWidth(mouseOver); // Calculate the width of the tooltip text
                        textAlign(LEFT, TOP);
                        rect(mouseX, mouseY, tWidth + 20, 40);// Draw the tooltip rectangle at the mouse position, slightly larger than the text for padding
                        fill(255);
                        text(mouseOver, mouseX + 10, mouseY + 10);
                        pop();// Restore the previous drawing state
                        break;// Exit the loop early since we only need to display one tooltip at a time
                    }
                }
            }
        }
    };
};