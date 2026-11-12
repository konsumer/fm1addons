// FM-1 add-ons: the OpenSCAD file run in the browser (OpenSCAD in WebAssembly), shown in 3D (three.js) and redrawn
// as its settings change, and its STLs to download. The file and its fonts are next to the page (scad/, copied there
// by the pages workflow), or one folder up (served from the repo), or from GitHub

const OPENSCAD = 'https://cdn.jsdelivr.net/npm/openscad-wasm-prebuilt@1.2.0/dist/openscad.js'
const BASES = ['scad/', '../scad/', 'https://raw.githubusercontent.com/konsumer/fm1addons/main/scad/']
const FONTS = ['LiberationSans-Bold.ttf', 'LiberationSans-Regular.ttf', 'LiberationMono-Bold.ttf', 'LiberationSerif-Bold.ttf']
const FONT_NAMES = { 'Liberation Sans:style=Bold': 'Sans bold', 'Liberation Sans:style=Regular': 'Sans', 'Liberation Mono:style=Bold': 'Mono bold', 'Liberation Serif:style=Bold': 'Serif bold' }
// v2: only what differs from the defaults is kept, so new defaults reach everyone (v1 kept all of it)
const STORE = 'fm1addons-v2'

// the settings: each one is the OpenSCAD file's variable of the same name, with its default
const MOUNT = (p, what) => [
  { k: `${p}_mount`, label: 'Mount', options: { shaft: 'On the bare shaft', cap: 'Over the stock knob' }, v: 'shaft', note: `How it holds on to the ${what}` },
  { k: `${p}_shaft_d`, label: 'Shaft diameter', v: 6, when: [`${p}_mount`, 'shaft'] },
  { k: `${p}_shaft_depth`, label: 'Shaft goes in', v: 7.5, when: [`${p}_mount`, 'shaft'] },
  { k: `${p}_cap_d`, label: 'Stock knob diameter', v: 8, when: [`${p}_mount`, 'cap'] },
  { k: `${p}_cap_h`, label: 'Stock knob height', v: 8, when: [`${p}_mount`, 'cap'] },
  { k: `${p}_fit`, label: 'Fit', v: 0.15, step: 0.05, min: -1, note: 'Added to the hole: less is tighter' }
]
const BODY = (p, d) => [
  { k: `${p}_d`, label: 'Body diameter', v: d.d },
  { k: `${p}_h`, label: 'Height', v: d.h },
  { k: `${p}_flanges`, label: 'Flanges', v: d.n, step: 1, min: 0 },
  { k: `${p}_flange_d`, label: 'Across the flanges', v: d.fd },
  { k: `${p}_flange_w`, label: 'Flange width', v: d.fw, step: 0.1 }
]
const OPEN = (p, d) => [
  { k: `${p}_open`, label: 'Open on top', v: true },
  { k: `${p}_hole_d`, label: 'Opening', v: d, when: [`${p}_open`, true] }
]

const PARTS = {
  knob_big: {
    name: 'Big flanges',
    color: '#7bc043',
    groups: [
      ['Knob', [...BODY('big', { d: 12, h: 14, n: 8, fd: 17, fw: 4 }), ...OPEN('big', 8)]],
      ['Fit (shared by both encoder knobs)', MOUNT('enc', 'encoder')]
    ]
  },
  knob_small: {
    name: 'Small flanges',
    color: '#e8e8e8',
    groups: [
      ['Knob', [...BODY('small', { d: 13, h: 12, n: 16, fd: 15, fw: 1.8 }), ...OPEN('small', 7.5)]],
      ['Fit (shared by both encoder knobs)', MOUNT('enc', 'encoder')]
    ]
  },
  knob_volume: {
    name: 'Volume',
    color: '#e8443a',
    groups: [
      ['Knob', BODY('vol', { d: 13, h: 12, n: 16, fd: 15, fw: 1.8 })],
      [
        'Notch',
        [
          { k: 'notch_w', label: 'Width', v: 1.4, step: 0.1 },
          { k: 'notch_depth', label: 'Depth', v: 1, step: 0.1 },
          { k: 'notch_angle', label: 'Angle', v: 0, step: 15, min: -360, note: 'Degrees counterclockwise from the back (+y)' },
          { k: 'notch_side', label: 'Down the side too', v: true }
        ]
      ],
      ['Fit', MOUNT('pot', 'volume pot')]
    ]
  },
  faceplate: {
    name: 'Faceplate',
    color: '#e8443a',
    textColor: '#ffffff',
    groups: [
      [
        'Text',
        [
          { k: 'label', label: 'Text', v: 'sloop', text: true },
          { k: 'label_font', label: 'Font', options: FONT_NAMES, v: 'Liberation Sans:style=Bold' },
          { k: 'label_size', label: 'Size', v: 7, step: 0.5 },
          { k: 'label_spacing', label: 'Letter spacing', v: 1, step: 0.05 },
          { k: 'label_style', label: 'Style', options: { raised: 'Raised', engraved: 'Engraved (or an inlay)', cut: 'Cut through' }, v: 'raised' },
          { k: 'label_depth', label: 'Raised / engraved', v: 0.6, step: 0.1, when: ['label_style', '!cut'] },
          { k: 'label_y', label: 'Move up', v: 0, step: 0.5, min: -50 },
          { k: 'label_fit', label: 'Fit to the width', v: false },
          { k: 'label_margin', label: 'Margin each side', v: 3, step: 0.5, when: ['label_fit', true] }
        ]
      ],
      [
        'Plate',
        [
          { k: 'plate', label: 'Width × height', v: [40, 46] },
          { k: 'plate_r', label: 'Corner radius', v: 5 },
          { k: 'plate_t', label: 'Thickness', v: 1.6, step: 0.1 },
          { k: 'plate_bevel', label: 'Edge chamfer', v: 0.6, step: 0.1 }
        ]
      ],
      [
        'Screen opening',
        [
          { k: 'window', label: 'Width × height', v: [32, 29] },
          { k: 'window_r', label: 'Corner radius', v: 2.5, step: 0.5 },
          { k: 'window_top', label: 'From the top edge', v: 5.5, step: 0.5 },
          { k: 'lip_h', label: 'Lip under it', v: 0, step: 0.1, note: 'Drops into the screen’s recess to line it up (0: a flat back)' },
          { k: 'lip_w', label: 'Lip width', v: 1.2, step: 0.1, when: ['lip_h', '>0'] }
        ]
      ]
    ]
  }
}

// --------------------------------------------------------------------------------------------- OpenSCAD ---
let openscad, files

// the OpenSCAD file and its fonts, from the first place that has them
async function load() {
  if (files) {
    return files
  }
  for (const base of BASES) {
    const r = await fetch(base + 'fm1addons.scad').catch(() => null)
    if (!r || !r.ok) {
      continue
    }
    const scad = await r.text()
    const fonts = await Promise.all(FONTS.map(async (f) => [f, new Uint8Array(await (await fetch(base + 'fonts/' + f)).arrayBuffer())]))
    files = { scad, fonts }
    return files
  }
  throw new Error('couldn’t get the OpenSCAD file')
}

const FONTS_CONF = '<?xml version="1.0"?>\n<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n<fontconfig><dir>/fonts</dir><cachedir>/tmp/fontcache</cachedir></fontconfig>\n'

function mkdirs(fs, path) {
  let at = ''
  for (const p of path.split('/').filter(Boolean)) {
    at += '/' + p
    try {
      fs.mkdir(at)
    } catch {}
  }
}

// one part as an STL. A new OpenSCAD each time: its main runs once
async function render(defines, custom) {
  openscad ||= await import(OPENSCAD)
  const { scad, fonts } = await load()
  const log = []
  const o = await openscad.createOpenSCAD({ noInitialRun: true, print: (s) => log.push(s), printErr: (s) => log.push(s) })
  const m = o.getInstance()
  if (m.ENV) {
    m.ENV.FONTCONFIG_PATH = '/fonts'
    m.ENV.FONTCONFIG_FILE = '/fonts/fonts.conf'
  }
  mkdirs(m.FS, '/fonts')
  mkdirs(m.FS, '/etc/fonts')
  m.FS.writeFile('/fonts/fonts.conf', FONTS_CONF)
  m.FS.writeFile('/etc/fonts/fonts.conf', FONTS_CONF)
  for (const [name, data] of fonts) {
    m.FS.writeFile('/fonts/' + name, data)
  }
  let text = scad
  if (custom) {
    m.FS.writeFile('/fonts/custom.ttf', custom.data)
    text = 'use <fonts/custom.ttf>\n' + scad
  }
  m.FS.writeFile('/fm1addons.scad', text)
  const args = ['/fm1addons.scad', '--backend=manifold', '--export-format=binstl', '-o', '/out.stl']
  for (const [k, v] of Object.entries(defines)) {
    args.push('-D', `${k}=${v}`)
  }
  let code
  try {
    code = m.callMain(args)
  } catch (e) {
    code = e?.status ?? 1
  }
  let stl
  try {
    stl = m.FS.readFile('/out.stl')
  } catch {}
  if (code || !stl) {
    const why = log.find((l) => /ERROR|Assertion/.test(l)) || log.at(-1) || 'OpenSCAD failed'
    throw new Error(why.replace(/^ERROR:\s*/, '').replace(/ in file .*$/, ''))
  }
  if (stl.length <= 84) {
    throw new Error('it came out empty' + (defines.part.includes('text') ? ' (is there any text?)' : ''))
  }
  return stl
}

// a value as OpenSCAD reads it
function lit(v) {
  if (Array.isArray(v)) {
    return `[${v.join(', ')}]`
  }
  if (typeof v === 'string') {
    return JSON.stringify(v)
  }
  return String(v)
}

// a TrueType or OpenType font's family and style, from its name table (as OpenSCAD's font= wants them)
function fontName(buf) {
  const v = new DataView(buf)
  const tables = v.getUint16(4)
  for (let i = 0; i < tables; i++) {
    const at = 12 + i * 16
    if (String.fromCharCode(v.getUint8(at), v.getUint8(at + 1), v.getUint8(at + 2), v.getUint8(at + 3)) !== 'name') {
      continue
    }
    const t = v.getUint32(at + 8)
    const count = v.getUint16(t + 2)
    const strings = t + v.getUint16(t + 4)
    const found = {}
    for (let j = 0; j < count; j++) {
      const r = t + 6 + j * 12
      const platform = v.getUint16(r)
      const id = v.getUint16(r + 6)
      const len = v.getUint16(r + 8)
      const off = strings + v.getUint16(r + 10)
      if ((id !== 1 && id !== 2 && id !== 16 && id !== 17) || found[`${id}:${platform}`]) {
        continue
      }
      let s = ''
      if (platform === 3 || platform === 0) {
        for (let k = 0; k < len; k += 2) {
          s += String.fromCharCode(v.getUint16(off + k))
        }
      } else {
        for (let k = 0; k < len; k++) {
          s += String.fromCharCode(v.getUint8(off + k))
        }
      }
      found[`${id}:${platform}`] = s
    }
    const get = (id) => found[`${id}:3`] || found[`${id}:0`] || found[`${id}:1`]
    const family = get(16) || get(1)
    const style = get(17) || get(2)
    if (family) {
      return style ? `${family}:style=${style}` : family
    }
  }
  throw new Error('that doesn’t look like a TrueType or OpenType font')
}

// --------------------------------------------------------------------------------------------- the view ---
async function viewer(canvas) {
  const THREE = await import('three')
  const { OrbitControls } = await import('three/addons/controls/OrbitControls.js')
  const { STLLoader } = await import('three/addons/loaders/STLLoader.js')
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(35, 1, 0.5, 2000)
  camera.up.set(0, 0, 1) // OpenSCAD's z is up
  camera.position.set(0, -100, 60)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444450, 2.2))
  const sun = new THREE.DirectionalLight(0xffffff, 1.6)
  sun.position.set(-60, -100, 160)
  scene.add(sun)
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enablePan = false
  const group = new THREE.Group()
  scene.add(group)
  const meshes = {}
  const loader = new STLLoader()
  let framed = false

  const size = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) {
      return
    }
    if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
  }
  // aim at it all, far enough that it fits however it's turned
  const frame = (fresh) => {
    const box = new THREE.Box3().setFromObject(group)
    if (box.isEmpty()) {
      return
    }
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    const fov = (camera.fov * Math.PI) / 180
    const fit = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect))
    let dir = camera.position.clone().sub(controls.target).normalize()
    if (fresh || !framed || !Number.isFinite(dir.x)) {
      dir = new THREE.Vector3(0.6, -2, 2.2).normalize()
    }
    controls.target.copy(sphere.center)
    camera.position.copy(sphere.center).addScaledVector(dir, (sphere.radius / Math.sin(fit / 2)) * 1.05)
    controls.update()
    framed = true
  }
  renderer.setAnimationLoop(() => {
    size()
    controls.update()
    renderer.render(scene, camera)
  })
  return {
    frame,
    color(name, color) {
      meshes[name]?.material.color.set(color)
    },
    set(name, stl, color) {
      if (meshes[name]) {
        group.remove(meshes[name])
        meshes[name].geometry.dispose()
        delete meshes[name]
      }
      if (!stl) {
        return
      }
      const geo = loader.parse(stl.buffer.slice(stl.byteOffset, stl.byteOffset + stl.byteLength))
      geo.computeVertexNormals()
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05 }))
      meshes[name] = mesh
      group.add(mesh)
    }
  }
}

// ------------------------------------------------------------------------------------------------ page ---
const $ = (s) => document.querySelector(s)

function defaults() {
  const v = {}
  for (const p of Object.values(PARTS)) {
    for (const [, fields] of p.groups) {
      for (const f of fields) {
        v[f.k] = f.v
      }
    }
  }
  return v
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {}
  } catch {
    return {}
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORE, JSON.stringify(s))
  } catch {}
}

function init() {
  const saved = loadState()
  const values = { ...defaults(), ...(saved.values || {}) }
  if (!FONT_NAMES[values.label_font]) {
    values.label_font = defaults().label_font // (an uploaded font isn't kept)
  }
  const colors = { ...Object.fromEntries(Object.entries(PARTS).map(([k, p]) => [k, p.color])), text: PARTS.faceplate.textColor, ...(saved.colors || {}) }
  let part = PARTS[saved.part] ? saved.part : 'faceplate'
  let custom = null // an uploaded font: { name, data }
  let view, timer, busy, again
  const urls = []
  const status = $('#status')
  const form = $('#fields')
  const downloads = $('#downloads')

  const say = (text, bad) => {
    status.textContent = text
    status.className = `note${bad ? ' bad' : ''}`
  }
  const save = () => {
    const d = defaults()
    const changed = Object.fromEntries(Object.entries(values).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(d[k])))
    saveState({ part, values: changed, colors })
  }

  // the part's settings, as a form
  const shows = (f) => {
    if (!f.when) {
      return true
    }
    const [k, want] = f.when
    const v = values[k]
    if (typeof want === 'string' && want.startsWith('!')) {
      return v !== want.slice(1)
    }
    if (typeof want === 'string' && want.startsWith('>')) {
      return v > +want.slice(1)
    }
    return v === want
  }
  const fieldHtml = (f) => {
    const id = `f-${f.k}`
    const note = f.note ? `<small>${f.note}</small>` : ''
    if (f.options) {
      const opts = { ...f.options }
      if (f.k === 'label_font' && custom) {
        opts[custom.name] = `Yours: ${custom.name.replace(':style=', ' ')}`
      }
      return `<label class="field" for="${id}"><span>${f.label}</span><select id="${id}" data-k="${f.k}">${Object.entries(opts)
        .map(([k, n]) => `<option value="${k}"${values[f.k] === k ? ' selected' : ''}>${n}</option>`)
        .join('')}</select>${note}</label>`
    }
    if (typeof f.v === 'boolean') {
      return `<label class="field check"><input type="checkbox" data-k="${f.k}"${values[f.k] ? ' checked' : ''} /> <span>${f.label}</span>${note}</label>`
    }
    if (f.text) {
      return `<label class="field wide" for="${id}"><span>${f.label}</span><input id="${id}" type="text" data-k="${f.k}" maxlength="40" />${note}</label>`
    }
    if (Array.isArray(f.v)) {
      return `<div class="field"><span>${f.label}</span><div class="pair">${f.v.map((_, i) => `<input type="number" inputmode="decimal" step="0.5" min="1" data-k="${f.k}" data-i="${i}" value="${values[f.k][i]}" aria-label="${f.label} ${i ? 'height' : 'width'}" />`).join('<span>×</span>')}</div>${note}</div>`
    }
    return `<label class="field" for="${id}"><span>${f.label}</span><input id="${id}" type="number" inputmode="decimal" step="${f.step ?? 0.5}" min="${f.min ?? 0}" data-k="${f.k}" value="${values[f.k]}" />${note}</label>`
  }
  const build = () => {
    const p = PARTS[part]
    form.innerHTML = p.groups.map(([title, fields]) => `<fieldset><legend>${title}</legend><div class="grid">${fields.filter(shows).map(fieldHtml).join('')}</div></fieldset>`).join('')
    if (part === 'faceplate') {
      form.insertAdjacentHTML('beforeend', `<fieldset><legend>Your own font</legend><label class="field wide"><span>A .ttf or .otf file</span><input type="file" id="font-file" accept=".ttf,.otf,font/ttf,font/otf" /><small>${custom ? `Using ${custom.name.replace(':style=', ' ')}` : 'Stays in your browser'}</small></label></fieldset>`)
      $('#font-file').onchange = pickFont
    }
    const t = form.querySelector('[data-k=label]')
    if (t) {
      t.value = values.label
    }
    $('#color').value = colors[part]
    $('#text-color').value = colors.text
    $('#text-color-wrap').hidden = part !== 'faceplate'
    for (const b of document.querySelectorAll('.parts button')) {
      b.setAttribute('aria-checked', String(b.dataset.part === part))
    }
  }

  const pickFont = async (e) => {
    const file = e.target.files[0]
    if (!file) {
      return
    }
    try {
      const buf = await file.arrayBuffer()
      custom = { name: fontName(buf), data: new Uint8Array(buf) }
      values.label_font = custom.name
      build()
      changed()
    } catch (err) {
      say(`That font didn’t work: ${err.message}`, true)
    }
  }

  form.addEventListener('input', (e) => {
    const el = e.target
    const k = el.dataset.k
    if (!k) {
      return
    }
    if (el.type === 'checkbox') {
      values[k] = el.checked
    } else if (el.dataset.i) {
      const v = parseFloat(el.value)
      if (!Number.isFinite(v)) {
        return
      }
      values[k] = values[k].map((x, i) => (i === +el.dataset.i ? v : x))
    } else if (el.type === 'number') {
      const v = parseFloat(el.value)
      if (!Number.isFinite(v)) {
        return
      }
      values[k] = v
    } else {
      values[k] = el.value
    }
    if (el.tagName === 'SELECT' || el.type === 'checkbox' || k === 'lip_h') {
      // (other fields may show or hide)
      const focus = document.activeElement?.dataset.k
      build()
      form.querySelector(`[data-k="${focus}"]`)?.focus()
    }
    changed()
  })

  // the pieces to make for a part: one, or the faceplate's two (to see them in two colors, and print them so)
  const pieces = () => {
    if (part !== 'faceplate') {
      return [{ part, color: () => colors[part], file: `fm1-${part.replace('_', '-')}.stl`, label: 'STL' }]
    }
    const slug = (values.label || 'blank').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
    const list = [{ part: 'faceplate_base', color: () => colors.faceplate, file: `fm1-faceplate-${slug}-plate.stl`, label: 'Plate' }]
    if (values.label_style !== 'cut' && values.label.trim()) {
      list.push({ part: 'faceplate_text', color: () => colors.text, file: `fm1-faceplate-${slug}-text.stl`, label: 'Text' })
    }
    return list
  }

  const defines = (p) => {
    const d = { part: lit(p) }
    for (const [, fields] of PARTS[part].groups) {
      for (const f of fields) {
        d[f.k] = lit(values[f.k])
      }
    }
    return d
  }

  // make the part for what's set; one at a time, the last change wins
  const make = async () => {
    if (busy) {
      again = true
      return
    }
    busy = true
    const making = part
    downloads.querySelectorAll('a').forEach((a) => a.setAttribute('aria-disabled', 'true'))
    say(openscad ? 'Making it…' : 'Getting OpenSCAD (about 11 MB, once)…')
    try {
      view ||= await viewer($('canvas'))
      const list = pieces()
      const made = []
      for (const piece of list) {
        made.push({ ...piece, stl: await render(defines(piece.part), custom) })
      }
      if (making !== part) {
        return // (another part was picked meanwhile: again is set)
      }
      for (const name of ['main', 'text']) {
        view.set(name, null)
      }
      made.forEach((m, i) => view.set(i ? 'text' : 'main', m.stl, m.color()))
      view.frame(true)
      while (urls.length) {
        URL.revokeObjectURL(urls.pop())
      }
      const links = made.map((m) => {
        const u = URL.createObjectURL(new Blob([m.stl], { type: 'model/stl' }))
        urls.push(u)
        return `<a class="button${m.label === 'Text' ? ' secondary' : ''}" href="${u}" download="${m.file}">${m.label}</a>`
      })
      if (part === 'faceplate') {
        // the whole faceplate, in one piece
        const whole = await render(defines('faceplate'), custom)
        const u = URL.createObjectURL(new Blob([whole], { type: 'model/stl' }))
        urls.push(u)
        links.unshift(`<a class="button" href="${u}" download="${made[0].file.replace('-plate.stl', '.stl')}">STL</a>`)
      }
      downloads.innerHTML = links.join('')
      say(part === 'faceplate' && made.length > 1 ? 'STL is it in one piece; Plate and Text are the two colors, to print together (or swap filament at the text). Drag it to turn it.' : 'Drag it to turn it.')
    } catch (e) {
      say(`It didn’t work: ${e.message}`, true)
    } finally {
      busy = false
      if (again) {
        again = false
        make()
      }
    }
  }
  const changed = () => {
    save()
    clearTimeout(timer)
    timer = setTimeout(make, 400)
  }

  $('.parts').innerHTML = Object.entries(PARTS)
    .map(([k, p]) => `<button type="button" role="radio" data-part="${k}">${p.name}</button>`)
    .join('')
  for (const b of document.querySelectorAll('.parts button')) {
    b.onclick = () => {
      if (b.dataset.part === part) {
        return
      }
      part = b.dataset.part
      build()
      downloads.innerHTML = ''
      changed()
    }
  }
  $('#color').oninput = (e) => {
    colors[part] = e.target.value
    view?.color('main', e.target.value)
    save()
  }
  $('#text-color').oninput = (e) => {
    colors.text = e.target.value
    view?.color('text', e.target.value)
    save()
  }
  $('#reset').onclick = () => {
    for (const [, fields] of PARTS[part].groups) {
      for (const f of fields) {
        values[f.k] = f.v
      }
    }
    colors[part] = PARTS[part].color
    if (part === 'faceplate') {
      colors.text = PARTS.faceplate.textColor
    }
    build()
    changed()
  }

  build()
  make()
}

init()
