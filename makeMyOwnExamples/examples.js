/**
 * Examples for Nature of Code
 * This file contains the documentation and example structures
 * Each section represents a chapter from Nature of Code
 */

// Define our documentation sections
const examples = {
    'introSection': {
        title: '🔄 Introduction to Simulations',
        content: `
# 🔄 Introduction to Simulations

Simulations in creative coding allow us to model and visualize natural phenomena. These examples introduce basic concepts that will be used throughout.

## Random Walker

A simple demonstration of randomness in simulations. The walker takes random steps in different directions.

<script id="random-walker" type="mini">
class Walker {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
  }
  
  step() {
    let choice = floor(random(4));
    
    if (choice === 0) {
      this.x++; // right
    } else if (choice === 1) {
      this.x--; // left
    } else if (choice === 2) {
      this.y++; // down
    } else {
      this.y--; // up
    }
  }
  
  display() {
    stroke(0);
    point(this.x, this.y);
  }
}

let walker;

function setup() {
  createCanvas(400, 400);
  background(220);
  walker = new Walker();
}

function draw() {
  walker.step();
  walker.display();
}
</script>

## Gaussian Distribution

A visualization of the Gaussian (normal) distribution. Points are plotted with more concentration in the middle.

<script id="gaussian" type="mini" data-context="
// Full context with setup and everything
let vals;
let nvals;

function setup() {
  createCanvas(400, 400);
  vals = new Array(width).fill(0);
  nvals = new Array(width).fill(0);
}

function draw() {
  background(220);
  
  // Regular random distribution
  let indR = floor(random(width));
  vals[indR]++;
  
  // Gaussian distribution
  let val = randomGaussian();
  let sd = 60;
  let mean = width/2;
  let indG = floor(val * sd + mean);
  if (indG > 0 && indG < width) {
    nvals[indG]++;
  }
  
  // Find the max value
  let maxVal = 0;
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] > maxVal) maxVal = vals[i];
    if (nvals[i] > maxVal) maxVal = nvals[i];
  }
  
  // Draw the distributions
  noStroke();
  fill(200, 0, 0, 100);
  // Draw uniform distribution
  for (let i = 0; i < vals.length; i++) {
    let h = map(vals[i], 0, maxVal, 0, height);
    rect(i, height - h, 1, h);
  }
  
  // Draw Gaussian distribution
  fill(0, 0, 200, 100);
  for (let i = 0; i < nvals.length; i++) {
    let h = map(nvals[i], 0, maxVal, 0, height);
    rect(i, height - h, 1, h);
  }
}" data-focus-start="20" data-focus-end="30">
// This is the Gaussian distribution part
// Get a Gaussian random number
let val = randomGaussian();
let sd = 60;
let mean = width/2;
let indG = floor(val * sd + mean);
if (indG > 0 && indG < width) {
  nvals[indG]++;
}
</script>

## Perlin Noise

Perlin noise creates smoother, more natural-looking random values, great for simulating natural phenomena.

<script id="perlin-noise" type="mini">
let xoff = 0;
let yoff = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220, 10);
  
  // Get a noise value based on xoff and scale it to be between 0 and width
  let x = map(noise(xoff), 0, 1, 0, width);
  let y = map(noise(yoff), 0, 1, 0, height);
  
  // Draw the ellipse
  noStroke();
  fill(40, 100, 200);
  ellipse(x, y, 20, 20);
  
  // Increment x offset
  xoff += 0.01;
  yoff += 0.02;
}
</script>
        `,
        subsections: {
            'random-walker': { title: 'Random Walker' },
            'gaussian': { title: 'Gaussian Distribution' },
            'perlin-noise': { title: 'Perlin Noise' }
        }
    },
    'vectorsSection': {
        title: '↗️ Vectors and Forces',
        content: `
# ↗️ Vectors and Forces

Vectors are essential for simulating physics and motion. They represent quantities with both magnitude and direction.

## Vector Basics

A simple demonstration of vector addition.

<script id="vector-basics" type="mini">
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  // Create vectors
  let center = createVector(width/2, height/2);
  let mouse = createVector(mouseX, mouseY);
  
  // Calculate vector from center to mouse
  let v = p5.Vector.sub(mouse, center);
  
  // Draw original vectors
  translate(center.x, center.y);
  strokeWeight(2);
  
  // Draw the vector
  stroke(0, 0, 255);
  line(0, 0, v.x, v.y);
  
  // Draw the vector components
  stroke(255, 0, 0);
  line(0, 0, v.x, 0);
  stroke(0, 255, 0);
  line(v.x, 0, v.x, v.y);
}
</script>

## Basic Motion

Simulating constant velocity motion.

<script id="basic-motion" type="mini">
let ball = {
  position: null,
  velocity: null
};

function setup() {
  createCanvas(400, 400);
  ball.position = createVector(width/2, height/2);
  ball.velocity = createVector(2.5, -2);
}

function draw() {
  background(220);
  
  // Update position
  ball.position.add(ball.velocity);
  
  // Check boundaries
  if (ball.position.x > width || ball.position.x < 0) {
    ball.velocity.x *= -1;
  }
  if (ball.position.y > height || ball.position.y < 0) {
    ball.velocity.y *= -1;
  }
  
  // Display ball
  noStroke();
  fill(40, 100, 200);
  ellipse(ball.position.x, ball.position.y, 20, 20);
}
</script>

## Adding Forces

A simple demonstration of adding forces like gravity and wind.

<script id="forces" type="mini" data-context="
// Full simulation code
class Mover {
  constructor(x, y, mass) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.mass = mass;
    this.r = sqrt(this.mass) * 10;
  }
  
  applyForce(force) {
    // F = m * a
    // a = F / m
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }
  
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }
  
  edges() {
    if (this.pos.y >= height - this.r) {
      this.pos.y = height - this.r;
      this.vel.y *= -0.8;
    }
    
    if (this.pos.x >= width - this.r) {
      this.pos.x = width - this.r;
      this.vel.x *= -0.8;
    } else if (this.pos.x <= this.r) {
      this.pos.x = this.r;
      this.vel.x *= -0.8;
    }
  }
  
  display() {
    stroke(0);
    strokeWeight(2);
    fill(127, 127, 200);
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }
}

let movers = [];
let wind, gravity;

function setup() {
  createCanvas(400, 400);
  for (let i = 0; i < 5; i++) {
    movers[i] = new Mover(random(width), 100, random(1, 5));
  }
  wind = createVector(0.1, 0);
  gravity = createVector(0, 0.2);
}

function draw() {
  background(220);
  
  for (let mover of movers) {
    // Apply forces
    mover.applyForce(gravity);
    
    if (mouseIsPressed) {
      mover.applyForce(wind);
    }
    
    mover.update();
    mover.edges();
    mover.display();
  }
}" data-focus-start="7" data-focus-end="14">
// Force application method
applyForce(force) {
  // F = m * a
  // a = F / m
  let f = p5.Vector.div(force, this.mass);
  this.acc.add(f);
}
</script>
        `,
        subsections: {
            'vector-basics': { title: 'Vector Basics' },
            'basic-motion': { title: 'Basic Motion' },
            'forces': { title: 'Forces' }
        }
    },
    'oscillationSection': {
        title: '🔄 Oscillation',
        content: `
# 🔄 Oscillation

Oscillation is rhythmic movement between two positions. These examples demonstrate harmonic motion, pendulums, and waves.

## Simple Harmonic Motion

A basic sine wave oscillation.

<script id="harmonic-motion" type="mini">
let angle = 0;
let aVelocity = 0.05;

function setup() {
  createCanvas(400, 200);
}

function draw() {
  background(220);
  
  // Calculate x and y position
  let amplitude = 100;
  let x = amplitude * sin(angle);
  
  angle += aVelocity;
  
  // Draw the oscillator
  translate(width/2, height/2);
  stroke(0);
  fill(40, 200, 40);
  line(0, 0, x, 0);
  circle(x, 0, 30);
}
</script>

## Simple Pendulum

Simulation of pendulum motion.

<script id="pendulum" type="mini">
let angle;
let aVelocity = 0;
let aAcceleration = 0;
let length;
let gravity = 0.98;
let origin;
let bob;

function setup() {
  createCanvas(400, 400);
  angle = PI/4;
  length = 200;
  origin = createVector(width/2, 0);
}

function draw() {
  background(220);
  
  // Calculate pendulum position
  bob = createVector(
    origin.x + length * sin(angle),
    origin.y + length * cos(angle)
  );
  
  // Draw pendulum
  stroke(0);
  strokeWeight(2);
  line(origin.x, origin.y, bob.x, bob.y);
  fill(40, 100, 200);
  circle(bob.x, bob.y, 30);
  
  // Calculate physics
  aAcceleration = -gravity / length * sin(angle);
  aVelocity += aAcceleration;
  angle += aVelocity;
  
  // Damping
  aVelocity *= 0.995;
}
</script>

## Wave Pattern

Creating a wave pattern with multiple particles.

<script id="wave" type="mini">
let angles = [];
let angleVelocities = [];
let amplitudes = [];

function setup() {
  createCanvas(600, 400);
  
  // Initialize waves
  for (let i = 0; i < 20; i++) {
    angles[i] = 0;
    angleVelocities[i] = 0.01 + i * 0.005;
    amplitudes[i] = random(10, 30);
  }
}

function draw() {
  background(220);
  
  // Draw each wave
  for (let i = 0; i < angles.length; i++) {
    let y = amplitudes[i] * sin(angles[i]);
    fill(40, 100, 200, 100);
    noStroke();
    ellipse(i * 30 + 30, height/2 + y, 20);
    
    // Update angle for next frame
    angles[i] += angleVelocities[i];
  }
}
</script>
        `,
        subsections: {
            'harmonic-motion': { title: 'Simple Harmonic Motion' },
            'pendulum': { title: 'Pendulum' },
            'wave': { title: 'Wave Patterns' }
        }
    }
}; 