#!/bin/sh
# Every part with its defaults, and the knob with each grip, with and without its indicator, as STLs in build/: needs openscad (a 2025+ snapshot, for --backend=manifold)
#   tools/stls.sh                  the faceplate says "o hai!"
#   tools/stls.sh "my text"        or this
set -e
cd "$(dirname "$0")/.."
out=build
mkdir -p "$out"
backend=
openscad --help 2>&1 | grep -q -- --backend && backend=--backend=manifold
label=${1:-o hai!}
for part in faceplate faceplate_base faceplate_text; do
  openscad $backend -q -D "part=\"$part\"" -D "label=\"$label\"" --export-format=binstl -o "$out/fm1-$part.stl" scad/fm1addons.scad
  echo "$out/fm1-$part.stl"
done
for grip in knurled gear smooth; do
  for indicator in false true; do
    name=fm1-knob-$grip
    if [ $indicator = true ]; then name=$name-indicator; fi
    openscad $backend -q -D 'part="knob"' -D "grip=\"$grip\"" -D "indicator=$indicator" --export-format=binstl -o "$out/$name.stl" scad/fm1addons.scad
    echo "$out/$name.stl"
  done
done
