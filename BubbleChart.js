var categoryColors = {
    "Parental Perceived Effectiveness": "#FF5733",
    "Parental Comfort Level": "#33FF57",
    "Teacher's Perceived Effectiveness": "#3357FF",
    "Teacher's Comfort Level": "#F9C80E",
};

function BubbleChart(){
    this.name = 'Bubble Chart'// Name of the chart
    this.id = 'bubble-chart'// DOM element ID for the chart
    this.loaded = false;// Flag indicating if the data is loaded
    this.data; // Variable to store the loaded data
    this.bubbles = [];// Array to hold all bubble objects
    this.maxAmt; // Variable to store the maximum value in the dataset for scaling bubble sizes
    this.daycares = []; // Array to hold names of daycares
    this.daycareButtons = [];// Array to hold button elements for each daycare
    this.bubblesToShow = []; // Array to hold bubbles that should be currently visible based on filtering
    // Object to store predefined positions and sizes for each daycare's representative circle
    this.daycarePositions = {
        "Daycare 1": { x: -300, y: -100, size: 230 },
        "Daycare 2": { x: 0, y: -100, size: 230 },
        "Daycare 3": { x: 300, y: -100, size: 230 },
        "Daycare 4": { x: -300, y: 170, size: 230 },
        "Daycare 5": { x: 0, y: 170, size: 230 },
        "Daycare 6": { x: 300, y: 170, size: 230 }
    };

    // Function to asynchronously load data before the visualization setup begins
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/daycare_sentiments.csv', 'csv', 'header',
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
    
    // Setup function to initialize the visualization
    // This includes generating buttons for each daycare, positioning them based on the predefined daycare circles,
    // and creating bubbles based on the data loaded in the preload function.
    this.setup = function () {
        var self = this;
        var rows = this.data.getRows();
        var numColumns = this.data.getColumnCount();

        // Assuming canvas is centered in the window or a specific div
        let canvasPosX = canvasContainer.position().x;
        let canvasPosY = canvasContainer.position().y;

        // Create buttons for each daycare
        for (var i = 1; i < numColumns; i++) {
            var daycareName = this.data.columns[i];
            this.daycares.push(daycareName);

            // Calculate button position based on daycare circle position
            var circlePos = this.daycarePositions[daycareName];
            if(circlePos) {

                var buttonX = canvasPosX + circlePos.x + (width / 2) + 260; // Adjust based on actual layout
                var buttonY = canvasPosY + circlePos.y + (height / 2) + circlePos.size / 2 + 10; // Same here
                var button = createButton(daycareName);
                button.style('position', 'absolute');
                button.style('left', `${buttonX}px`);
                button.style('top', `${buttonY}px`);
                button.mousePressed(function() {
                    console.log("Button pressed:", this.elt.innerHTML); // Using innerHTML since value isn't set
                    self.changeDaycare(this.elt.innerHTML);
                });
                this.daycareButtons.push(button);
            }
        }
    
        this.maxAmt = 0;
    
        // Iterate over each row to create bubbles
        rows.forEach(row => {
            var categoryName = row.get(0);
            var color = categoryColors[categoryName] || "#FFFFFF"; // Default to white if not found

            for (var j = 1; j < numColumns; j++) {
                var daycareName = this.data.columns[j]; // Get the daycare name from the column header
                var n = row.getNum(j); // Get the value for this daycare
    
                if (n != "") {
                    if (n > this.maxAmt) {
                        this.maxAmt = n; // Update maxAmt if this value is greater
                    }
    
                    // Create a new Bubble with the current category name, daycare name, and value
                    //var bubble = new Bubble(categoryName, daycareName, this.daycarePositions, color); // Pass color here
                    var bubble = new Bubble(categoryName, daycareName, this.daycarePositions, color, n); // Pass sentiment value directly
                    bubble.data.push(n); // Assuming you're associating data with bubbles like this
                    this.bubbles.push(bubble);
                    bubble.setData(0, this.maxAmt); // Set bubble size based on sentiment value
                }
            }});

    
        // Set initial bubble positions
        for (var i = 0; i < this.bubbles.length; i++) {
            var daycareName = this.bubbles[i].daycare;
            if (this.daycarePositions[daycareName]) {
                var daycareCircle = this.daycarePositions[daycareName];
                let radius;
                // Adjust the calculation of random positions for bubbles to ensure they're evenly distributed within circles
                let angle = random(TWO_PI);
                let maxRadius = daycareCircle.size / 2 - this.bubbles[i].size / 2 - 10; // Adjusted for a buffer of 10 units
                let validPosition = false;
                while (!validPosition) {
                    let radius = random(0, maxRadius);
                    this.bubbles[i].pos.x = daycareCircle.x + cos(angle) * radius;
                    this.bubbles[i].pos.y = daycareCircle.y + sin(angle) * radius;
                    // Check if the bubble's position is within the circle
                    let distanceFromCenter = dist(this.bubbles[i].pos.x, this.bubbles[i].pos.y, daycareCircle.x, daycareCircle.y);
                    if (distanceFromCenter <= maxRadius) {
                        validPosition = true;
                    }
                }

                this.bubbles[i].pos.x = daycareCircle.x + cos(angle) * radius;
                this.bubbles[i].pos.y = daycareCircle.y + sin(angle) * radius;
            }
        }
    };
     
    // Draws circles representing each daycare on the canvas
    this.drawDaycareCircles = function() {

        let daycarePositions = [
            { x: -300, y: -100, size: 230, label: "Daycare 1" }, // Positions relative to the center
            { x: 0, y: -100, size: 230, label: "Daycare 2" },
            { x: 300, y: -100, size: 230, label: "Daycare 3" },
            { x: -300, y: 170, size: 230, label: "Daycare 4" },
            { x: 0, y: 170, size: 230, label: "Daycare 5" },
            { x: 300, y: 170, size: 230, label: "Daycare 6" }
        ];

        // Draw each daycare circle
        daycarePositions.forEach(dc => {
            fill(240); // Light gray for circles
            stroke(0); // Black border
            ellipse(dc.x, dc.y, dc.size, dc.size);

        });
    };
      
    // Handles the logic for filtering bubbles based on the selected daycare.
    // Toggles visibility and repositions bubbles associated with the selected daycare.
    this.changeDaycare = function(daycareName) {
        console.log("Changing daycare to:", daycareName);
        this.currentDaycare = daycareName; // Update the current daycare
    
        let daycareCircle = this.daycarePositions[daycareName];
        console.log("Daycare Circle:", daycareCircle);
        if (!daycareCircle) {
            console.error("Daycare position not found:", daycareName);
            return;
        }
    
        // Clear the bubbles to show
        this.bubblesToShow = [];
    
        // Toggle visibility of bubbles associated with the selected daycare
        this.bubbles.forEach(bubble => {
            if (bubble.daycare === daycareName) {
                if (!bubble.visible) {
                    let angle = random(TWO_PI);
                    let radius = random(0, daycareCircle.size / 2 - bubble.size / 2);
                    bubble.pos.x = daycareCircle.x + cos(angle) * radius;
                    bubble.pos.y = daycareCircle.y + sin(angle) * radius;
                    bubble.visible = true;
                } else {
                    bubble.visible = false;
                }
            }
            // Collect bubbles to show
            if (bubble.visible) {
                this.bubblesToShow.push(bubble);
            }
        });
    };
    
    // The primary drawing loop for the visualization.
    // Updates and draws bubbles based on their visibility and current positions.
    this.draw = function() {
        background(255);
    
        push();
        resetMatrix();
        fill(0); // Text color
        noStroke();
        textSize(24);
        textAlign(CENTER, TOP);
        text("Digitalization in Daycares: Sentiment Analysis", width / 2, 20);
        pop();
        
        translate(width / 2, height / 2);
        this.drawDaycareCircles();
    
        let hoveredBubble = null;
    
        // Update positions and draw all bubbles
        this.bubblesToShow.forEach(bubble => {
            bubble.update(this.bubblesToShow, this.daycarePositions); // Keep the logic for updating positions
            bubble.draw(); // Draw the bubble itself
            if (bubble.isMouseOver()) {
                hoveredBubble = bubble; // Identify the hovered bubble
            }
        });
    
        // Draw all labels on top of the bubbles
        this.bubblesToShow.forEach(bubble => {
            bubble.drawLabel(); // Draw labels after drawing all bubbles to ensure they're on top
        });
    
        // Display tooltip if a bubble is hovered
        if (hoveredBubble) {
            this.displayTooltip(hoveredBubble);
        }
    };
    
    // Displays a tooltip with additional information when a bubble is hovered.
    this.displayTooltip = function(bubble) {
        push();
        fill(255); // White background for better readability
        stroke(0); // Black border for contrast
        textSize(16);
        // Include both the category name and sentiment value in the tooltip text
        let tooltipText = `${bubble.name}: ${bubble.sentimentValue}`;
        let textWidthEstimate = textWidth(tooltipText) + 10; // Estimate the width of the tooltip box

        // Calculate starting x-coordinate for the rectangle to center it around the mouse cursor
        let rectX = mouseX - width / 2 - textWidthEstimate / 2;
        let textX = rectX + 5; // Adjust text position to be within the rectangle, slightly padded from the left edge

        rect(rectX, mouseY - height / 2 - 20, textWidthEstimate, 20); // Draw the tooltip rectangle centered around the cursor
        fill(0); // Black text color
        noStroke();
        textAlign(LEFT, TOP);
        text(tooltipText, textX, mouseY - height / 2 - 15); // Position the text within the tooltip
        pop();
         };

    // Cleans up the visualization by removing button elements and clearing arrays.
    this.destroy = function() {
        console.log("destroy function executed");
        this.daycareButtons.forEach(button => button.remove());
        this.daycareButtons = []; 
        this.bubbles = [];
        this.daycares = [];
        clear(); 
    };  
}