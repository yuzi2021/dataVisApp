function Box(x, y, width, height, category){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.category = category;

    this.mouseOver = function(mouseX, mouseY){
        if (mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height){
            return `${this.category.name}: ${this.category.percentage}%`;
        }
        return false;
    };

    this.draw = function (){
        fill(this.category.colour);
        rect(this.x, this.y, this.width, this.height);
    };
}