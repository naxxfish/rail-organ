const Soundfont = require('soundfont-player')
const io = require('socket.io-client')
require('fetch')

var $ = require('jquery')

var ac = new AudioContext()

function descriptionToNote (descr) {
  const SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const OCTAVES = [ 3, 4, 5, 6 ]
  const trainClass = parseInt(descr.substring(0, 1))
  const trainLetter = descr.charCodeAt(1) - 65
  const octave = OCTAVES[trainClass % OCTAVES.length]
  const note = SCALE[trainLetter % SCALE.length]
  console.log(`trainClass: ${trainClass} trainLetter: ${trainLetter} note: ${note}${octave}`)
  return `${note}${octave}`
}

function playNote (ac, note, instrument, impulse) {
  console.log(`Playing note ${note}`)
  instrument.stop()
  instrument.play(note)
}

async function fetchSample (path) {
  return fetch(path)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => ac.decodeAudioData(arrayBuffer))
}

$(async function () {
  const impulse = await fetchSample('/impulses/AirportTerminal.wav')
  let convolver = ac.createConvolver()
  convolver.buffer = impulse
  convolver.connect(ac.destination)
  const harp = await Soundfont.instrument(ac, '/soundfont/orchestral_harp-mp3.js')
  harp.connect(convolver)
  playNote(ac, descriptionToNote('2M62'), harp, impulse)

  var socket = io('http://localhost:3000', {
    path: '/td/websocket'
  })
  socket.on('connect', function () {
    socket.emit('room', 'berth.all')
    console.log('joined some rooms')
    /*
    socket.emit('room', 'signal.VC.TRSV1')
    socket.emit('room', 'signal.VC.TRSV2')
    socket.emit('room', 'signal.VC.TRSV3')
    socket.emit('room', 'signal.VC.TRSV4')
    socket.emit('room', 'signal.VC.TRSV5')
    socket.emit('room', 'signal.VC.TRSV6')
    socket.emit('room', 'signal.VC.TRSV7')
    socket.emit('room', 'signal.VC.TRSV8')
    socket.emit('room', 'signal.VC.TRSV9')
    socket.emit('room', 'signal.VC.TRSV10')
    socket.emit('room', 'signal.VC.TRSV11')
    socket.emit('room', 'signal.VC.TRSV12')
    socket.emit('room', 'signal.VC.TRSV13')
    socket.emit('room', 'signal.VC.TRSV14')
    socket.emit('room', 'signal.VC.TRSV15')
    socket.emit('room', 'signal.VC.TRSV16')
    socket.emit('room', 'signal.VC.TRSV17')
    socket.emit('room', 'signal.VC.TRSV18')
    socket.emit('room', 'signal.VC.TRSV19')
    */
    // socket.emit('room', 'clock')
    /*
    socket.emit('room', 'berth.VC.F003')
    socket.emit('room', 'berth.VC.F007')
    socket.emit('room', 'berth.VC.F009')
    socket.emit('room', 'berth.VC.F011')
    socket.emit('room', 'berth.VC.F013')
    socket.emit('room', 'berth.VC.F015')
    socket.emit('room', 'berth.VC.F017')
    socket.emit('room', 'berth.VC.F517')
    socket.emit('room', 'berth.VC.F515')
    socket.emit('room', 'berth.VC.F513')
    socket.emit('room', 'berth.VC.F511')
    socket.emit('room', 'berth.VC.F509')
    socket.emit('room', 'berth.VC.F503')
    socket.emit('room', 'berth.VC.F501')
    socket.emit('room', 'berth.VC.F497')
    socket.emit('room', 'berth.VC.F495')

    socket.emit('room', 'berth.VC.R003')
    socket.emit('room', 'berth.VC.R007')
    socket.emit('room', 'berth.VC.R009')
    socket.emit('room', 'berth.VC.R011')
    socket.emit('room', 'berth.VC.R013')
    socket.emit('room', 'berth.VC.R015')
    socket.emit('room', 'berth.VC.R017')
    socket.emit('room', 'berth.VC.R517')
    socket.emit('room', 'berth.VC.R515')
    socket.emit('room', 'berth.VC.R513')
    socket.emit('room', 'berth.VC.R511')
    socket.emit('room', 'berth.VC.R509')
    socket.emit('room', 'berth.VC.R503')
    socket.emit('room', 'berth.VC.R501')
    socket.emit('room', 'berth.VC.R497')
    socket.emit('room', 'berth.VC.R495')
    */
  })

  socket.on('signal', function (rawMsg) {
    const msg = JSON.parse(rawMsg)
    if (msg.status === 'ON') {
      playNote(ac, descriptionToNote('2M62'))
    }
    console.log(msg)
  })

  socket.on('berth', function (rawMsg) {
    const msg = JSON.parse(rawMsg)
    console.log(msg)
    if (msg.descr !== '') {
      console.log(`train ${msg.descr} moved`)
      playNote(ac, 'C4', harp, impulse)
    }
  })

  /*socket.on('time', function (clock) {
    console.log('clock', clock)
  })*/
})
