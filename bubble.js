function Bubble(_name, daycare, daycarePositions, color, sentimentValue)
{
    this.size = 20;
    this.target_size = 20;
    this.pos = createVector(0,0);
    this.daycare = daycare;
    this.direction = createVector(0,0);
    this.name = _name;
    this.color = color; // Use the passed color
    this.data = [];
    this.visible = false; 
    this.daycarePositions = daycarePositions; // Store daycarePositions as an instance variable
    this.sentimentValue = sentimentValue; // Store sentiment value directly

    // Method to draw the bubble without the label
    this.draw = function() {
        push();
        fill(this.color);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.size);
        pop();
        this.drawLabel();
    };

    // Inside the Bubble class
    this.drawLabel = function() {
        push();
        fill(0); // Black text color for contrast
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(16); // Adjust font size as needed

        // Convert name to initials
        let initials = this.name.split(' ').map(word => word[0]).join('').toUpperCase();

        text(initials, this.pos.x, this.pos.y);
        pop();
    };

    //This method checks if the mouse pointer is hovering over the bubble.
    this.isMouseOver = function() {
        return dist(mouseX - width / 2, mouseY - height / 2, this.pos.x, this.pos.y) < this.size / 2;
    };
    
    //Updates the bubble's position based on interactions with other bubbles in the _bubbles array.
    this.update = function(_bubbles) {
        this.direction.set(0, 0);
        
        for(var i = 0; i < _bubbles.length; i++) {
            if(_bubbles[i].name != this.name) {
                var v = p5.Vector.sub(this.pos, _bubbles[i].pos); 
                var d = v.mag();
    
                if(d < this.size / 2 + _bubbles[i].size / 2) {
                    if(d > 0) {
                        this.direction.add(v);
                    } else {
                        this.direction.add(p5.Vector.random2D());    
                    }
                }
            }
        }
        //After processing all bubbles, it normalizes the direction vector to ensure uniform speed
        this.direction.normalize();
        // scales this direction to set speed
        this.direction.mult(2);
        //updates the bubble's position 
        this.pos.add(this.direction);
    
        // Limit the bubble's position within the boundaries of its daycare circle
        let daycareCircle = this.daycarePositions[this.daycare];
        if (daycareCircle) {
            // Calculate the distance from the bubble to the center of the daycare circle
            let distanceFromCenter = dist(this.pos.x, this.pos.y, daycareCircle.x, daycareCircle.y);
            let maxDistance = daycareCircle.size / 2 - this.size / 2;
            if (distanceFromCenter > maxDistance) {
                // If the bubble extends beyond the circle's boundary, move it back
                let angle = atan2(this.pos.y - daycareCircle.y, this.pos.x - daycareCircle.x);
                this.pos.x = daycareCircle.x + cos(angle) * maxDistance;
                this.pos.y = daycareCircle.y + sin(angle) * maxDistance;
            }
        }
        
        // Update the bubble's size towards the target size
        if (this.size < this.target_size) {
            this.size += 1; // Adjust the increment for a smoother growth
        } else if (this.size > this.target_size) {
            this.size -= 1; // Adjust the decrement for a smoother shrinkage
        }
    }
       
    //set the target_size property of the object based on a value from its data array. 
    //The size is dynamically calculated to reflect the significance of the data point within a specified range.
    this.setData = function(i, maxAmt)
    {
        this.target_size = map(this.data[i], 0, maxAmt, 10, 110);
    } 

}