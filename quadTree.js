class Quadtree {
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  subdivide() {
    const { x, y, width, height } = this.boundary;
    const w = width / 2;
    const h = height / 2;

    this.northEast = new Quadtree(
      { x: x + w, y, width: w, height: h },
      this.capacity,
    );
    this.northWest = new Quadtree({ x, y, width: w, height: h }, this.capacity);
    this.southEast = new Quadtree(
      { x: x + w, y: y + h, width: w, height: h },
      this.capacity,
    );
    this.southWest = new Quadtree(
      { x, y: y + h, width: w, height: h },
      this.capacity,
    );

    this.divided = true;
  }

  insert(point) {
    if (!this.contains(point)) return false;

    if (this.points.length < this.capacity) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) this.subdivide();

    return (
      this.northEast.insert(point) ||
      this.northWest.insert(point) ||
      this.southEast.insert(point) ||
      this.southWest.insert(point)
    );
  }

  contains([px, py]) {
    const { x, y, width, height } = this.boundary;
    return px >= x && px < x + width && py >= y && py < y + height;
  }

  queryRange(range, foundPoints = []) {
    if (!this.intersects(range)) return foundPoints;

    for (const point of this.points) {
      if (this.pointInRange(point, range)) foundPoints.push(point);
    }

    if (this.divided) {
      this.northEast.queryRange(range, foundPoints);
      this.northWest.queryRange(range, foundPoints);
      this.southEast.queryRange(range, foundPoints);
      this.southWest.queryRange(range, foundPoints);
    }

    return foundPoints;
  }

  intersects({ x, y, width, height }) {
    const b = this.boundary;
    return !(
      x > b.x + b.width ||
      x + width < b.x ||
      y > b.y + b.height ||
      y + height < b.y
    );
  }

  pointInRange([px, py], { x, y, width, height }) {
    return px >= x && px <= x + width && py >= y && py <= y + height;
  }
}
