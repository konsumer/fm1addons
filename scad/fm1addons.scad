// Add-ons for the M-VAVE FM-1: knobs for its encoders and its volume pot, and a faceplate around its screen with
// your own text. Everything prints without supports, the side that sits on the FM-1 down.
//
//   part  knob         a knob for any of the 8 (they're all the same shaft): its grip knurled, a gear, or smooth,
//                      open on top or closed, and with a value indicator or not (for MASTER, which stops at each end)
//         faceplate    the frame around the screen, with its text
//         faceplate_base, faceplate_text  the same in two pieces, for printing it in two colors
//         preview      all of them
//
// openscad -D 'part="faceplate"' -D 'label="hello"' -o faceplate.stl fm1addons.scad (tools/stls.sh makes them all)
//
// Sizes are in mm, from the FM-1 (161.5 x 96.5 mm): 8 knobs, all on round knurled 6 mm shafts. On the left, MASTER
// and the SELECT, PRESETS and ALGORITHM encoders, on a 17 mm grid: keep those knobs under 16 mm across. On the right,
// KNOB1-4, 18.2 mm apart: keep them under 17 mm. Print one to check the fit.

use <fonts/LiberationSans-Bold.ttf>
use <fonts/LiberationSans-Regular.ttf>
use <fonts/LiberationMono-Bold.ttf>
use <fonts/LiberationSerif-Bold.ttf>

/* [What] */
part = "preview";  // [preview, knob, tester, faceplate, faceplate_base, faceplate_text]

/* [Knob] */
grip = "knurled";   // [knurled, gear, smooth] knurled: small ridges; gear: big ones
knob_d = 15;        // across (at the ridges): under 16 on the left, 17 on the right
knob_h = 12;
knob_open = true;   // open on top
knob_hole_d = 7.5;  // the opening

/* [Value indicator] */
indicator = false;     // a groove across the top (and down the side) that shows where it's turned to
indicator_w = 1.4;
indicator_depth = 1;
indicator_angle = 0;   // where it points: 0 is the back (+y), counterclockwise
indicator_side = true; // down the side too

/* [How the knob holds on] */
shaft = "encoder";  // [encoder, pot] encoder: the 7 encoders, 18 coarse splines; pot: MASTER, a finer knurl
shaft_d = 6;        // the shaft's diameter, at its teeth
shaft_depth = 7.5;  // how far it goes in
splines = 18;       // encoder: the hole has as many ridges, to mesh with the shaft's grooves (0: a round hole)
spline_depth = 0.4; // how far they stand in
fit = 0.1;          // encoder: added to the hole (less, or below 0: tighter)
pot_fit = 0;        // pot: added to its round hole (it holds by friction)
tester_fits = [-0.1, 0, 0.1, 0.2, 0.3]; // tester: a ring for each, for the shaft that's set

/* [Faceplate] */
plate = [40, 46];      // outside: width, height. The screen's black glass is 38 x 38, with ~10 mm under it to the keys
plate_r = 5;           // its corners
plate_t = 1.6;         // thickness
plate_bevel = 0.6;     // the top edge's chamfer
window = [32, 29];     // the screen's opening (the display is about 32 x 28.5)
window_r = 2.5;
window_top = 5.5;      // from the plate's top edge to the opening (the display is ~4.7 mm under the glass's top edge)
lip_h = 0;             // a lip under the opening's edge, to drop into the screen's recess (0: none, a flat back)
lip_w = 1.2;
label = "o hai!";
label_font = "Liberation Sans:style=Bold";
label_size = 7;
label_spacing = 1;
label_style = "raised";  // [raised, engraved, cut]
label_depth = 0.6;     // raised: how high; engraved: how deep
label_y = 0;           // moves it up from the middle of the space under the opening
label_fit = false;     // shrink or grow it to the plate's width (less label_margin each side)
label_margin = 3;

$fn = 64;
eps = 0.01;

// ------------------------------------------------------------------------------------------------ knobs ---
// the outline: a body with ridges round it, out to d across their tips
module ridged(d, n, rh, rw) {
  circle(d = d - 2 * rh);
  if (n > 0 && rh > 0)
    for (i = [0:n - 1])
      rotate(i * 360 / n) hull() {
        circle(d = rw);
        translate([d / 2 - rw / 2, 0]) circle(d = rw);
      }
}

// a knob, from z = 0 (the side on the FM-1) up. open: a hole hole_d across from the top to where the shaft ends.
// indicator: a groove across the top from the middle (or the opening) to the edge, and down the side
// the grips' ridges: how many, how far they stand out, how wide
function grip_ridges(g) = g == "gear" ? [8, 2, 3.5] : g == "knurled" ? [16, 1, 1.8] : [0, 0, 0];

// the hole for the shaft, depth deep from z = 0, and starting wider so it finds the shaft. f: what's added to it
module shaft_hole(depth, f = shaft == "pot" ? pot_fit : fit) {
  d = shaft_d + f;
  n = shaft == "pot" ? 0 : splines;
  translate([0, 0, -eps]) {
    linear_extrude(depth + eps) {
      if (n > 0) polygon([for (i = [0:2 * n - 1]) (i % 2 ? d / 2 - spline_depth : d / 2) * [cos(i * 180 / n), sin(i * 180 / n)]]);
      else circle(d = d);
    }
    cylinder(h = 0.6, d1 = d + 1, d2 = d - (n > 0 ? 2 * spline_depth : 0));
  }
}

// rings to find the fit: one for each of tester_fits, for the shaft that's set, with what it adds on its tab
module tester() {
  for (i = [0:len(tester_fits) - 1]) translate([i * 13, 0, 0]) difference() {
    union() {
      cylinder(h = 5, d = 10.5);
      translate([-3, 4, 0]) cube([6, 6, 2]);
      translate([0, 7.5, 2 - eps]) linear_extrude(0.6) text(str(tester_fits[i]), size = 2.2, font = "Liberation Sans:style=Bold", halign = "center", valign = "center");
    }
    shaft_hole(5 + 1, tester_fits[i]);
  }
}

module knob(d = knob_d, h = knob_h, g = grip, open = knob_open, hole_d = knob_hole_d, indicator = indicator,
            c = 0.8) {
  rg = grip_ridges(g);
  n = rg[0];
  rh = rg[1];
  rw = rg[2];
  r = d / 2;
  inside = shaft_depth;
  assert(inside < h - (open ? 0 : 1), "the knob is too short for what goes in it");
  difference() {
    intersection() {
      linear_extrude(h) ridged(d, n, rh, rw);
      // a chamfer round the top, and a smaller one round the bottom
      rotate_extrude() polygon([[0, 0], [r - 0.4, 0], [r, 0.4], [r, h - c], [r - c, h], [0, h]]);
    }
    shaft_hole(inside);
    if (open) translate([0, 0, inside]) cylinder(h = h, d = hole_d);
    if (indicator) rotate(90 + indicator_angle) {
      from = open ? 0 : r * 0.25;
      translate([from, -indicator_w / 2, h - indicator_depth]) cube([r, indicator_w, indicator_depth + 1]);
      if (indicator_side) translate([r - rh - indicator_depth, -indicator_w / 2, h * 0.35]) cube([r, indicator_w, h]);
    }
  }
}

// -------------------------------------------------------------------------------------------- faceplate ---
module rrect(s, r) {
  r = min(r, s.x / 2 - eps, s.y / 2 - eps);
  translate([r, r]) offset(r) square([s.x - 2 * r, s.y - 2 * r]);
}

win_at = [(plate.x - window.x) / 2, plate.y - window_top - window.y];
assert(win_at.x > 0 && win_at.y > 0, "the opening doesn't fit in the plate");

module window2d(grow = 0) {
  translate(win_at - [grow, grow]) rrect(window + [2 * grow, 2 * grow], window_r + grow);
}

module label2d() {
  translate([plate.x / 2, win_at.y / 2 + label_y]) {
    if (label_fit) resize([plate.x - 2 * label_margin, 0], auto = true) label_text();
    else label_text();
  }
}

module label_text() {
  text(label, size = label_size, font = label_font, halign = "center", valign = "center", spacing = label_spacing);
}

// the plate, from z = 0 (its back, on the FM-1) up; the lip under it
module plate_body() {
  b = min(plate_bevel, plate_t - 0.4);
  difference() {
    union() {
      hull() {
        linear_extrude(plate_t - b) rrect(plate, plate_r);
        translate([b, b, 0]) linear_extrude(plate_t) rrect(plate - [2 * b, 2 * b], plate_r - b);
      }
      if (lip_h > 0) translate([0, 0, -lip_h]) linear_extrude(lip_h + eps) difference() {
        window2d(lip_w);
        window2d();
      }
    }
    translate([0, 0, -lip_h - 1]) linear_extrude(plate_t + lip_h + 2) window2d();
  }
}

module faceplate_base() {
  difference() {
    plate_body();
    if (label_style == "engraved") translate([0, 0, plate_t - label_depth]) linear_extrude(plate_t) label2d();
    if (label_style == "cut") translate([0, 0, -1]) linear_extrude(plate_t + 2) label2d();
  }
}

// the text alone: raised, on the plate; engraved, filling its engraving (an inlay, flush)
module faceplate_text() {
  if (label_style == "raised") translate([0, 0, plate_t - eps]) linear_extrude(label_depth + eps) label2d();
  if (label_style == "engraved") translate([0, 0, plate_t - label_depth]) linear_extrude(label_depth) label2d();
}

module faceplate() {
  faceplate_base();
  faceplate_text();
}

// ----------------------------------------------------------------------------------------------- parts ---
if (part == "knob") knob();
else if (part == "tester") tester();
else if (part == "faceplate") faceplate();
else if (part == "faceplate_base") faceplate_base();
else if (part == "faceplate_text") faceplate_text();
else {
  color("#7bc043") translate([0, -18, 0]) knob(g = "gear");
  color("#e8e8e8") translate([20, -18, 0]) knob();
  color("#e8443a") translate([38, -18, 0]) knob(indicator = true);
  color("#e8443a") faceplate_base();
  color("#ffffff") faceplate_text();
}
