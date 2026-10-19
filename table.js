// table.js: your State Table, in code.
//
// Copy your paper table in here row for row. Nothing else in the starter needs to
// change for a new state to work: sense.js applies these rules, fake-sense.js uses
// the names, piece.js reads the result.
//
// signals: the numbers your sensing writes, each 0 to 1. Each partner owns one.
// states:  checked top to bottom; the first row whose rule is true wins.
//          hold is in seconds: how long a rule has to stay true before the state
//          changes. Without it the piece flickers between two words.
//          Keep "nobody" last, so it catches everything the other rows miss.

window.TABLE = {
  signals: [
    'present',
    'browInnerUp',
    'eyeBlinkRight',
    'eyeBlinkLeft',
    'mouthPucker',
  ],

  states: [
    // Higher-priority expressions come first; nobody catches the rest last.
    {
      name: 'surprised',
      when: s => s.browInnerUp > 0.8,
      hold: 2,
      piece: 'The image cracks and shakes.',
      forThem: 'Rewards paying attention.',
      toThem: 'The screen cracks when they open their eyes.',
    },
    {
      name: 'closed-eyes',
      when: s => s.eyeBlinkRight > 0.55 && s.eyeBlinkLeft > 0.55,
      hold: 5,
      piece: 'The image fades to black.',
      forThem: 'It changes when they do pay attention.',
      toThem: 'Nothing.',
    },
    {
      name: 'focused',
      when: s => s.present > 0.2 && s.browInnerUp < 0.2 && s.mouthPucker > 0.3,
      hold: 2,
      piece: 'Resolution and contrast slowly increase.',
      forThem: 'Rewards strong attentiveness.',
      toThem: 'The image changes the longer they focus.',
    },
      {
        name: 'neutral',
        when: s => s.present > 0.2,
        hold: 0.5,
        piece: 'A quiet circle holds on the screen.',
      },
    {
      name: 'nobody',
      when: s => s.present < 0.2,
      hold: 5,
      piece: 'The screen goes dark and waits.',
      forThem: 'Nothing runs while they are away.',
      toThem: 'Nothing.',
    },
  ],
};
