// Initializes a Waffle chart with specified parameters for positioning, size, data, and visualization options.
function Waffle(x, y, width, height, boxes_across, boxes_down, table, columnHeading, specificResponseOptions) {
    var self = this; // Reference to the Waffle chart instance for use in nested functions.
    
    // Chart positioning and dimensions
    this.x = x; // The x-coordinate of the chart's top-left corner.
    this.y = y; // The y-coordinate of the chart's top-left corner.
    this.height = height; // The height of the chart.
    this.width = width; // The width of the chart.
    this.boxes_down = boxes_down; // The number of boxes vertically.
    this.boxes_across = boxes_across; // The number of boxes horizontally.
    
    // Chart data and visualization configurations
    this.categories = []; // To store category data derived from the dataset.
    this.specificResponseOptions = specificResponseOptions; // Specific response options to categorize data.
    this.titleBorder = { x: 0, y: 0, w: 0, h: 0 }; // Placeholder for chart title border dimensions, initialized to zero.
    this.tooltipText = ""; // Placeholder for tooltip text.
    var boxes = []; // Internal storage for the individual boxes that make up the waffle chart.
    this.columnHeading = columnHeading; // The column heading from the dataset used to label the chart.

    // Visibility and display options
    this.isVisible = true; // Controls the visibility of the chart.
    this.showPercentages = false; // Controls the display of percentages on the chart.

    // Method to populate the chart with categories based on the dataset and response options
    this.addCategories = function() {
        var column = table.getColumn(columnHeading); // Extracts the column data from the table based on the specified heading.

        // Determines the main category from the column heading, used to select the appropriate colour palette.
        var mainCategory = columnHeading.includes("Parental") ? 
                           columnHeading.split("Parental ")[1] : 
                           columnHeading.split("Teacher's ")[1];

        var colourPalette = colourPalettes[mainCategory]; // Selects the colour palette based on the main category.

        // Error handling for missing colour palette
        if (!colourPalette) {
            console.error("Colour palette not found for main category:", mainCategory);
            return; // Exits the function if no matching colour palette is found, to avoid errors.
        }

        // Iterates through specific response options to calculate the count for each and populate the categories array.
        for (var i = 0; i < self.specificResponseOptions.length; i++) {
            var option = self.specificResponseOptions[i]; // The current response option.
            var count = column.filter(response => response.trim() === option).length; // Counts occurrences of the option.

            // Adds the current category to the categories array with its associated data.
            self.categories.push({
                "name": option,
                "count": count,
                "colour": colourPalette[i], // Assigns a colour from the palette.
                "category": columnHeading,
                "percentage": parseFloat(((count / column.length) * 100).toFixed(2)), // Calculates the percentage.
                "visible": true // Sets the category as visible by default.
            });
        }

        // Calculates the number of boxes to be filled for each category, rounding to the nearest whole number.
        for (var i = 0; i < self.categories.length; i++) {
            var totalResponses = column.length; // The total number of responses in the column.
            // Calculates the proportion of boxes that should be filled for the category.
            self.categories[i].boxes = Math.round((self.categories[i].count / totalResponses) * (self.boxes_down * self.boxes_across));
        }
    };

    
    // This method is responsible for generating and positioning the individual boxes that comprise the waffle chart. Each box represents a portion of the dataset, with the arrangement and colouration reflecting the distribution of data across predefined categories.
    this.addBoxes = function() {
        var boxWidth = self.width / self.boxes_across; // Determines the width of each box based on the total width of the chart and the number of boxes across.
        var boxHeight = self.height / self.boxes_down; // Determines the height of each box based on the total height of the chart and the number of boxes down.

        var currentCategoryIndex = 0; // Tracks the current category being processed.
        var currentBoxCountForCategory = 0; // Tracks the number of boxes processed for the current category.

        // Iterates through each row and column within the chart's grid to place the boxes accordingly.
        for (var i = 0; i < self.boxes_down; i++) {
            boxes.push([]); // Prepares a new row for box placement.
            for (var j = 0; j < self.boxes_across; j++) {
                // Checks if there are still categories left to process.
                if (currentCategoryIndex < self.categories.length) {
                    var category = self.categories[currentCategoryIndex]; // Retrieves the current category.
                    // Creates a new box with the appropriate dimensions and category-based colour, then adds it to the current row.
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

            // Tooltip logic: Shows a tooltip if the mouse hovers over the title area of the chart
            if (mouseX > this.titleBorder.x && mouseX < this.titleBorder.x + this.titleBorder.w &&
                mouseY > this.titleBorder.y && mouseY < this.titleBorder.y + this.titleBorder.h) {
                var textW = textWidth(this.tooltipText); // Calculate the width of the tooltip text
                var tooltipWidth = textW + 20; // Add padding around the text for the tooltip box
                var tooltipHeight = 25; // Define a fixed height for the tooltip

                // Draw the tooltip box and text near the mouse cursor
                push();
                fill(0); // Set fill colour for the tooltip box
                rect(mouseX, mouseY, tooltipWidth, tooltipHeight, 5); // Draw the tooltip box with rounded corners
                fill(255); // Set text colour to white for contrast
                noStroke(); // Remove stroke for the text
                textAlign(LEFT, CENTER);
                text(this.tooltipText, mouseX + 10, mouseY + tooltipHeight / 2); // Position the text within the tooltip box
                pop();
            }

            // Draw percentages for each category next to the last box of the category, if enabled
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
    this.addTitles = function() {
        var titleText = this.columnHeading; // Use the column heading as the title text
        textSize(16); // Set title text size
        var textW = textWidth(titleText); // Calculate width of the title text
        var textX = this.x + (this.width / 2) - (textW / 2); // Center the title text above the chart
        var textY = this.y - 30; // Position the title text above the chart with a fixed offset
        
        // Draw the title text
        push();
        fill(0); // Set title text color
        noStroke(); // Remove stroke for the title text
        textAlign(CENTER, BOTTOM); // Align the text to the center and bottom for consistent positioning
        text(titleText, textX, textY); // Draw the title text
        pop();
    };

    // Method to create a button for toggling the visibility of the chart
    this.createHideShowButton = function() {
        // Create a button with an eye icon to indicate visibility toggle
        this.hideShowButton = createButton('👁️');
        // Position the button relative to the chart's position
        this.hideShowButton.position(this.x + this.width - 30, this.y - 30);
        // Define a mousePressed event for the button to toggle the chart's visibility
        this.hideShowButton.mousePressed(() => {
            this.toggleVisibility();
        });
        // Set id and name for the button
        this.hideShowButton.elt.setAttribute('id', 'hideShowButton');
        this.hideShowButton.elt.setAttribute('name', 'hideShowButton');
      };

    // Method to toggle the visibility state of the chart
    this.toggleVisibility = function() {
        // Toggle the isVisible flag
        this.isVisible = !this.isVisible;
        // Redraw the chart to reflect the updated visibility state
        this.draw();
    };

    // Method to create a button for toggling the display of percentages on the chart
    this.createPercentageButton = function() {
        // Create a button with a percent symbol to indicate toggling percentages
        this.percentageButton = createButton('%');
        // Position the button near the hide/show button for consistency
        this.percentageButton.position(this.x + this.width, this.y - 30);
        // Define a mousePressed event for the button to toggle the display of percentages
        this.percentageButton.mousePressed(() => {
            this.togglePercentages();
        });
    };

    // Method to toggle the display of percentages on the chart
    this.togglePercentages = function() {
        // Toggle the showPercentages flag
        this.showPercentages = !this.showPercentages;
        // Redraw the chart to reflect the updated state
        this.draw();
    };

    // Removes interactive buttons from the chart's interface.
    this.removeButtons = function() {
        // Check if the hide/show visibility toggle button exists
        if (this.hideShowButton) {
            this.hideShowButton.remove(); // Remove the button from the DOM
            this.hideShowButton = null; // Clear the reference to prevent memory leaks or unintended interactions
        }
        // Check if the percentage toggle button exists
        if (this.percentageButton) {
            this.percentageButton.remove(); // Remove the button from the DOM
            this.percentageButton = null; // Clear the reference for the same reasons mentioned above
        }
    };

        // Checks if the mouse is hovering over any of the chart's boxes to display tooltips with additional information.
    this.checkMouse = function(mouseX, mouseY) {
        // Iterate through all rows of boxes
        for (var i = 0; i < boxes.length; i++) {
            // Iterate through each box in the current row
            for (var j = 0; j < boxes[i].length; j++) {
                // Ensure the current box is associated with a category before proceeding
                if (boxes[i][j].category !== undefined) {
                    // Check if the mouse is currently over this box
                    var mouseOver = boxes[i][j].mouseOver(mouseX, mouseY);
                    // If `mouseOver` returns a truthy value, it means the mouse is over a box that should display a tooltip
                    if (mouseOver !== false) {
                        push(); // Start a new drawing state
                        fill(0); // Set the fill color for the tooltip background to black for readability
                        textSize(10); // Set the tooltip text size
                        var tWidth = textWidth(mouseOver); // Calculate the width of the tooltip text
                        // Draw the tooltip rectangle at the mouse position, slightly larger than the text for padding
                        rect(mouseX, mouseY, tWidth + 20, 40);
                        fill(255); // Set the text color to white for contrast
                        // Display the tooltip text inside the rectangle, offset slightly for padding
                        text(mouseOver, mouseX + 10, mouseY + 10);
                        pop(); // Restore the previous drawing state
                        break; // Exit the loop early since we only need to display one tooltip at a time
                    }
                }
            }
        }
    };
};