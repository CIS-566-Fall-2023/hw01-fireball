# [Project 1: Noise](https://github.com/CIS-566-Fall-2022/hw01-fireball-base)

# Submission - Thomas Shaw

![](./readme_assets/fireball_space.png)

### [Live demo](https://printer83mph.github.io/cis5660-hw01-fireball/)

For this homework, I took inspiration from one of my most recent favorite games, Outer Wilds, and specifically the comet in an elliptical orbit around the sun known as [The Interloper](https://static.wikia.nocookie.net/outerwilds_gamepedia/images/7/7c/The_Interloper.png/revision/latest?cb=20190718011901). One thing that bugged me about its representation in-game is that I never felt convinced that it was hurtling through space. It didn't really use any fancy shader effects to create a sense of movement, only a general shape. Therefore one of my goals would be to implement moving fire in a convincing way using noise functions.

My first thought was to somehow store lifetimes of particles as they moved up the fireball, but that was structurally impossible in a shader which doesn't keep track of state between frames (unless I added that to the CPU side but no way was I doing that). Instead I opted for a similar approach to the [flower](https://www.shadertoy.com/view/mtBfDd) Yuhan and I made in lab 1. Similar to a [shephard tone](https://en.wikipedia.org/wiki/Shepard_tone), there are multiple noise samples whose coordinates are all constantly rising on the y-axis, but starting and ending faded out (in terms of intensity). There was some tricky math involved in blending between these noise functions procedurally over time, requiring some simplified `triangle wave`s and `smoothstep`ing, but I think it ended up quite nice (and can be parameterized as well).

To get the blobby shape i wanted, I sampled the "intensity" of the flames, `mix`ed with a number in the range 0 to 1 where 0 is the front of the flame and 1 is the back. The splotch at the front of the comet favors the position stronger, while the splotches in the middle/back more heavily favor the noise, making them more sporadic and wobbly.

I wanted to make it clear this was space, so I plopped in a super-scaled-up cube, normalized its `fs_Pos` coordinates to get texture coordinates all on a sphere, and used voronoi `jitter`ing to get stars all around the comet. I also added a time-based rotation to make the comet "spin".

## Objective

Get comfortable with using WebGL and its shaders to generate an interesting 3D, continuous surface using a multi-octave noise algorithm.

## Getting Started

1. Fork and clone [this repository](https://github.com/CIS700-Procedural-Graphics/Project1-Noise).

2. Copy your hw0 code into your local hw1 repository.

3. In the root directory of your project, run `npm install`. This will download all of those dependencies.

4. Do either of the following (but I highly recommend the first one for reasons I will explain later).

   a. Run `npm start` and then go to `localhost:7000` in your web browser

   b. Run `npm run build` and then go open `index.html` in your web browser

   You should hopefully see the framework code with a 3D cube at the center of the screen!

## Developing Your Code

All of the JavaScript code is living inside the `src` directory. The main file that gets executed when you load the page as you may have guessed is `main.js`. Here, you can make any changes you want, import functions from other files, etc. The reason that I highly suggest you build your project with `npm start` is that doing so will start a process that watches for any changes you make to your code. If it detects anything, it'll automagically rebuild your project and then refresh your browser window for you. Wow. That's cool. If you do it the other way, you'll need to run `npm build` and then refresh your page every time you want to test something.

## Publishing Your Code

We highly suggest that you put your code on GitHub. One of the reasons we chose to make this course using JavaScript is that the Web is highly accessible and making your awesome work public and visible can be a huge benefit when you're looking to score a job or internship. To aid you in this process, running `npm run deploy` will automatically build your project and push it to `gh-pages` where it will be visible at `username.github.io/repo-name`.

## Setting up `main.ts`

Alter `main.ts` so that it renders the icosphere provided, rather than the cube you built in hw0. You will be writing a WebGL shader to displace its surface to look like a fireball. You may either rewrite the shader you wrote in hw0, or make a new `ShaderProgram` instance that uses new GLSL files.

## Noise Generation

Across your vertex and fragment shaders, you must implement a variety of functions of the form `h = f(x,y,z)` to displace and color your fireball's surface, where `h` is some floating-point displacement amount.

- Your vertex shader should apply a low-frequency, high-amplitude displacement of your sphere so as to make it less uniformly sphere-like. You might consider using a combination of sinusoidal functions for this purpose.
- Your vertex shader should also apply a higher-frequency, lower-amplitude layer of fractal Brownian motion to apply a finer level of distortion on top of the high-amplitude displacement.
- Your fragment shader should apply a gradient of colors to your fireball's surface, where the fragment color is correlated in some way to the vertex shader's displacement.
- Both the vertex and fragment shaders should alter their output based on a uniform time variable (i.e. they should be animated). You might consider making a constant animation that causes the fireball's surface to roil, or you could make an animation loop in which the fireball repeatedly explodes.
- Across both shaders, you should make use of at least four of the functions discussed in the Toolbox Functions slides.

## Noise Application

View your noise in action by applying it as a displacement on the surface of your icosahedron, giving your icosahedron a bumpy, cloud-like appearance. Simply take the noise value as a height, and offset the vertices along the icosahedron's surface normals. You are, of course, free to alter the way your noise perturbs your icosahedron's surface as you see fit; we are simply recommending an easy way to visualize your noise. You could even apply a couple of different noise functions to perturb your surface to make it even less spherical.

In order to animate the vertex displacement, use time as the third dimension or as some offset to the (x, y, z) input to the noise function. Pass the current time since start of program as a uniform to the shaders.

For both visual impact and debugging help, also apply color to your geometry using the noise value at each point. There are several ways to do this. For example, you might use the noise value to create UV coordinates to read from a texture (say, a simple gradient image), or just compute the color by hand by lerping between values.

## Interactivity

Using dat.GUI, make at least THREE aspects of your demo interactive variables. For example, you could add a slider to adjust the strength or scale of the noise, change the number of noise octaves, etc.

Add a button that will restore your fireball to some nice-looking (courtesy of your art direction) defaults. :)

## Extra Spice

Choose one of the following options:

- Background (easy-hard depending on how fancy you get): Add an interesting background or a more complex scene to place your fireball in so it's not floating in a black void
- Custom mesh (easy): Figure out how to import a custom mesh rather than using an icosahedron for a fancy-shaped cloud.
- Mouse interactivity (medium): Find out how to get the current mouse position in your scene and use it to deform your cloud, such that users can deform the cloud with their cursor.
- Music (hard): Figure out a way to use music to drive your noise animation in some way, such that your noise cloud appears to dance.

## Submission

- Update README.md to contain a solid description of your project
- Publish your project to gh-pages. `npm run deploy`. It should now be visible at http://username.github.io/repo-name
- Create a [pull request](https://help.github.com/articles/creating-a-pull-request/) to this repository, and in the comment, include a link to your published project.
- Submit the link to your pull request on Canvas.
