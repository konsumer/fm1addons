// Add-ons for the M-VAVE FM-1: knobs for its encoders and its volume pot, and a faceplate around its screen with
// your own text. Everything prints without supports, the side that sits on the FM-1 down.
//
//   part  knob_big     encoder knob with big flanges (a gear), for KNOB1-4 on the right
//         knob_small   encoder knob with small flanges (knurled), for SELECT, PRESETS and ALGORITHM
//         knob_volume  MASTER volume knob, closed on top, with a notch to show its value
//         faceplate    the frame around the screen, with its text
//         faceplate_base, faceplate_text  the same in two pieces, for printing it in two colors
//         preview      all of them
//
// openscad -D 'part="faceplate"' -D 'label="hello"' -o faceplate.stl fm1addons.scad (tools/stls.sh makes them all)
//
// Sizes are in mm, from the FM-1 (161.5 x 96.5 mm): 8 knobs, all on round knurled 6 mm shafts. On the left, MASTER
// (the volume pot, which stops at each end) and the SELECT, PRESETS and ALGORITHM encoders, on a 17 mm grid: keep
// those knobs under 16 mm across. On the right, KNOB1-4, 18.2 mm apart: keep them under 17 mm. Print one to check the fit.

use <fonts/LiberationSans-Bold.ttf>
use <fonts/LiberationSans-Regular.ttf>
use <fonts/LiberationMono-Bold.ttf>
use <fonts/LiberationSerif-Bold.ttf>

/* [What] */
part = "preview";  // [preview, knob_big, knob_small, knob_volume, faceplate, faceplate_base, faceplate_text]

/* [Encoders: how the knobs hold on] */
enc_mount = "shaft";  // [shaft, cap] shaft: onto the bare shaft (stock knob off); cap: over the stock knob
enc_shaft_d = 6;      // shaft's diameter (round, knurled)
enc_shaft_depth = 7.5; // how far the shaft goes in
enc_cap_d = 8;        // cap: the stock knob's diameter (about 8)
enc_cap_h = 8;        // cap: how tall it is
enc_fit = 0.15;       // added to the holes (less, or below 0: tighter)

/* [Big flanges] */
big_d = 12;         // the body
big_h = 14;
big_flanges = 8;
big_flange_d = 17;  // across the flanges' tips (KNOB1-4 are 18.2 mm apart)
big_flange_w = 4;   // each flange's width
big_open = true;    // open on top
big_hole_d = 8;     // the opening

/* [Small flanges] */
small_d = 13;
small_h = 12;
small_flanges = 16;
small_flange_d = 15; // the left knobs are 17 mm apart
small_flange_w = 1.8;
small_open = true;
small_hole_d = 7.5;

/* [Volume pot] */
pot_mount = "shaft";  // [shaft, cap]
pot_shaft_d = 6;
pot_shaft_depth = 7.5;
pot_cap_d = 8;
pot_cap_h = 8;
pot_fit = 0.15;
vol_d = 13;
vol_h = 12;
vol_flanges = 16;
vol_flange_d = 15;
vol_flange_w = 1.8;
notch_w = 1.4;      // the notch: its width
notch_depth = 1;    // how deep
notch_angle = 0;    // where it points: 0 is the back (+y), counterclockwise
notch_side = true;  // down the side too

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
label = "sloop";
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
// the outline: a body with flanges round it
module flanged(d, n, fd, fw) {
  circle(d = d);
  if (n > 0 && fd > d)
    for (i = [0:n - 1])
      rotate(i * 360 / n) hull() {
        circle(d = fw);
        translate([fd / 2 - fw / 2, 0]) circle(d = fw);
      }
}


// a knob, from z = 0 (the side on the FM-1) up. open: a hole hole_d across from the top to where the shaft (or the
// stock knob) ends
module knob(d, h, n, fd, fw, mount, shaft_d, depth, cap_d, cap_h, fit, open = false, hole_d = 0, c = 0.8) {
  r = max(d, fd) / 2;
  inside = mount == "cap" ? cap_h : depth;
  assert(inside < h - (open ? 0 : 1), "the knob is too short for what goes in it");
  difference() {
    intersection() {
      linear_extrude(h) flanged(d, n, fd, fw);
      // a chamfer round the top, and a smaller one round the bottom
      rotate_extrude() polygon([[0, 0], [r - 0.4, 0], [r, 0.4], [r, h - c], [r - c, h], [0, h]]);
    }
    translate([0, 0, -eps]) linear_extrude(inside + eps) {
      if (mount == "cap") circle(d = cap_d + fit);
      else circle(d = shaft_d + fit);
    }
    // the shaft's hole starts wider: it finds the shaft
    if (mount != "cap") translate([0, 0, -eps]) cylinder(h = 0.6, d1 = shaft_d + fit + 1, d2 = shaft_d + fit);
    if (open) translate([0, 0, inside]) cylinder(h = h, d = hole_d);
  }
}

module knob_big() {
  knob(big_d, big_h, big_flanges, big_flange_d, big_flange_w, enc_mount, enc_shaft_d, enc_shaft_depth,
       enc_cap_d, enc_cap_h, enc_fit, big_open, big_hole_d);
}

module knob_small() {
  knob(small_d, small_h, small_flanges, small_flange_d, small_flange_w, enc_mount, enc_shaft_d,
       enc_shaft_depth, enc_cap_d, enc_cap_h, enc_fit, small_open, small_hole_d);
}

module knob_volume() {
  r = max(vol_d, vol_flange_d) / 2;
  difference() {
    knob(vol_d, vol_h, vol_flanges, vol_flange_d, vol_flange_w, pot_mount, pot_shaft_d,
         pot_shaft_depth, pot_cap_d, pot_cap_h, pot_fit);
    // the notch: across the top from near the middle to the edge, and down the side
    rotate(90 + notch_angle) {
      translate([r * 0.25, -notch_w / 2, vol_h - notch_depth]) cube([r, notch_w, notch_depth + 1]);
      if (notch_side) translate([vol_d / 2 - notch_depth, -notch_w / 2, vol_h * 0.35]) cube([r, notch_w, vol_h]);
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
if (part == "knob_big") knob_big();
else if (part == "knob_small") knob_small();
else if (part == "knob_volume") knob_volume();
else if (part == "faceplate") faceplate();
else if (part == "faceplate_base") faceplate_base();
else if (part == "faceplate_text") faceplate_text();
else {
  color("#7bc043") translate([0, -18, 0]) knob_big();
  color("#e8e8e8") translate([22, -18, 0]) knob_small();
  color("#e8443a") translate([42, -18, 0]) knob_volume();
  color("#e8443a") faceplate_base();
  color("#ffffff") faceplate_text();
}
