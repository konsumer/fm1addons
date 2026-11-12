# fm1addons

Knobs and a faceplate with your own text for the [M-VAVE FM-1](https://www.m-vave.com/), as OpenSCAD, with a web page to change them and download STLs.

- **Big flanges**: an encoder knob shaped like a gear, for KNOB1-4 on the right
- **Small flanges**: a knurled encoder knob, for SELECT, PRESETS and ALGORITHM on the left
- **Volume**: a knob for the MASTER volume pot, closed on top, with a notch to show where it's at
- **Faceplate**: the frame around the screen, with your text: raised, engraved (or an inlay), or cut through. It comes in one piece, or as plate and text for two colors

Knobs go on the bare shaft (the FM-1's are 6 mm, round and knurled) or over the stock knob.

## The page

`npm start`, then open <http://localhost:8000/site/>. It runs OpenSCAD in your browser (WebAssembly), shows the part in 3D, and gives you its STL. Pick your own font there too (a `.ttf` or `.otf`).

## OpenSCAD

`scad/fm1addons.scad` has every setting at the top (OpenSCAD's Customizer shows them). `npm run stls` (or `tools/stls.sh "your text"`) makes them all in `build/`:

```sh
openscad -D 'part="faceplate"' -D 'label="hello"' -o faceplate.stl scad/fm1addons.scad
```

The defaults are a starting point: measure your FM-1, and print one to check the fit.

The fonts in `scad/fonts` are [Liberation](https://github.com/liberationfonts/liberation-fonts) (SIL Open Font License, `scad/fonts/LICENSE-Liberation`).
