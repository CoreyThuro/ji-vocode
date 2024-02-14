// Define the fundamental frequency for the vocoder bands
const fundamental = 440; // A4 as the base frequency

// Initialize the modulator (microphone input)
const modulator = new Tone.UserMedia();
const attackTime = 0.01; // 10 milliseconds
const releaseTime = 0.1;

// Initialize an array to hold our bands, each with its own filter, envelope follower, and carrier oscillator
let bands = [];

const compressor = new Tone.Compressor({
  threshold: -20, // Threshold in dB
  ratio: 4, // Compression ratio
  attack: 0.003, // Attack time in seconds
  release: 0.25 // Release time in seconds
}).toDestination();

const eq = new Tone.EQ3({
  low: -10, // Cut or boost lows by dB
  mid: 0, // Cut or boost mids by dB
  high: 5 // Cut or boost highs by dB
}).toDestination();

// Function to create a bandpass filter, envelope follower, and carrier oscillator for a given frequency
function createBand(frequency) {
    // Create the filter
    const filter = new Tone.Filter({
      frequency: frequency, // The center frequency for the bandpass filter
      type: 'bandpass',
      Q: 10 // Example Q value, adjust based on your needs
  });
      modulator.connect(filter);

    // Create the envelope follower
    const envelopeFollower = new Tone.Follower(attackTime, releaseTime);

    filter.connect(envelopeFollower);

    // Create the carrier oscillator for this band
    const carrierOscillator = new Tone.Oscillator(frequency, "square").start();
    modulator.connect(Tone.Destination);
    carrierOscillator.volume.value = -Infinity; // Initially silent
    envelopeFollower.connect(carrierOscillator.volume); // Modulate volume with envelope follower

    // Connect the carrier oscillator to the destination (audio output)
    carrierOscillator.connect(eq).connect(compressor).toDestination();

    // Return the components of this band
    return { filter, envelopeFollower, carrierOscillator };
}



// Function to calculate frequencies and create bands
function setupVocoder() {
  // Define a series of just intonation ratios
  const lowerRatios = [1/1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2/1, 9/4, 5/2, 11/4, 3/1, 13/4, 7/2, 15/4];
  const multipliedRatios = lowerRatios.map(ratio => ratio * 4); // Multiply each element by 2
  const dividedRatios = lowerRatios.map(ratio => ratio / 2)
  const combinedRatios = [...lowerRatios, ...multipliedRatios, ...dividedRatios]
  // Calculate frequencies for 15 bands based on just intonation ratios
  const frequencies = combinedRatios.map(ratio => fundamental * ratio);

  // Create bands for each frequency
  bands = frequencies.map(createBand);
}

// Function to start audio processing
async function startAudio() {
    try {
        // Open the user's microphone
        await modulator.open();
        console.log("Microphone is open");
        
        // No need to triggerAttack on the carrier in this adjusted concept
    } catch (e) {
        console.error("The microphone was not accessible.", e);
    }
}

// Set up the vocoder
setupVocoder();

// Add a button or some other method to start the vocoder
// Assuming there's a button with the ID 'startButton' in your HTML
document.getElementById('startButton').addEventListener('click', startAudio);
