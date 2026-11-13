# fm1addons

Knobs and a faceplate with your own text for the [M-VAVE FM-1](https://www.m-vave.com/), as OpenSCAD, with a web page to change them and download STLs.

- **Knob**: one knob for any of the 8. Its grip is knurled, a gear, or smooth; it's open on top or closed; and it can have a value indicator, for MASTER (the volume pot stops at each end). Its hole has 18 ridges that mesh with the encoders' grooves, and fits MASTER's finer knurl too
- **Faceplate**: the frame around the screen, with your text: raised, engraved (or an inlay), or cut through. It comes in one piece, or as plate and text for two colors

Knobs go on the FM-1's shafts: 6 mm, knurled.

## The page

`npm start`, then open <http://localhost:8000/site/>. It runs OpenSCAD in your browser (WebAssembly), shows the part in 3D, and gives you its STL. Pick your own font there too (a `.ttf` or `.otf`).

## OpenSCAD

`scad/fm1addons.scad` has every setting at the top (OpenSCAD's Customizer shows them). `npm run stls` (or `tools/stls.sh "your text"`) makes them all in `build/`:

```sh
openscad -D 'part="faceplate"' -D 'label="hello"' -o faceplate.stl scad/fm1addons.scad
```

The defaults fit the FM-1: they're tested on one, printed in PLA.

The fonts in `scad/fonts` are [Liberation](https://github.com/liberationfonts/liberation-fonts) (SIL Open Font License, `scad/fonts/LICENSE-Liberation`).
