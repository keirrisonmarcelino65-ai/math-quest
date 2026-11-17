/* sprites.js - pixel art desenhada por código (cada letra é um pixel da paleta) */
(function (MQ) {
  // converte uma matriz de letras em um canvas ampliado, sem suavização
  function make(rows, palette, scale) {
    var h = rows.length, w = rows[0].length;
    var c = document.createElement('canvas');
    c.width = w * scale;
    c.height = h * scale;
    var g = c.getContext('2d');
    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var ch = rows[y].charAt(x);
        if (ch === '.' || !palette[ch]) continue;
        g.fillStyle = palette[ch];
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return c;
  }

  var HEAD = [
    '...hhhhhh...',
    '..hhhhhhhh..',
    '..hsssssss..',
    '..ssesssess.',
    '..ssssssss..',
    '...ssssss...'
  ];

  var HERO_PALETTE = { h: '#5a3418', s: '#f2c392', e: '#1a1a2e', r: '#e63946', b: '#3a5bd9', k: '#2b2b3a' };

  var HERO = {
    idle: HEAD.concat([
      '..rrrrrrrr..', '.rrrrrrrrrr.', '.ssrrrrrrss.', '.ss.rrrr.ss.',
      '...bbbbbb...', '...bbbbbb...', '...bb..bb...', '...bb..bb...', '..kkk..kkk..', '..kkk..kkk..'
    ]),
    walkA: HEAD.concat([
      '..rrrrrrrr..', '.rrrrrrrrrr.', '.ssrrrrrrss.', '.ss.rrrr.ss.',
      '...bbbbbb...', '...bbbbbb...', '..bb....bb..', '.bb......bb.', '.kk......kk.', 'kkk......kkk'
    ]),
    walkB: HEAD.concat([
      '..rrrrrrrr..', '.rrrrrrrrrr.', '.ssrrrrrrss.', '.ss.rrrr.ss.',
      '...bbbbbb...', '...bbbbbb...', '....bbbb....', '....bbbb....', '....kkkk....', '...kkkkkk...'
    ]),
    jump: HEAD.concat([
      '.s.rrrrrr.s.', '.s.rrrrrr.s.', '..rrrrrrrr..', '..rrrrrrrr..',
      '...bbbbbb...', '..bbb..bbb..', '..bb....bb..', '..kk....kk..', '..kk....kk..', '............'
    ])
  };

  var SLIME = [
    '....gggggg....',
    '..gggggggggg..',
    '.gggggggggggg.',
    '.gwwkggggwwkg.',
    '.gwwkggggwwkg.',
    '.gggggggggggg.',
    'gggggkkkkggggg',
    'gggggggggggggg',
    'dddddddddddddd',
    '.dddddddddddd.'
  ];

  var SLIME_COLORS = {
    forest: { g: '#7bd34a', d: '#4d9a2a', w: '#ffffff', k: '#1a1a2e' },
    temple: { g: '#e7a23c', d: '#b06f1c', w: '#ffffff', k: '#1a1a2e' },
    castle: { g: '#c75fd6', d: '#8a3a9a', w: '#ffffff', k: '#1a1a2e' }
  };

  var HEART = [
    '.rr.rr.',
    'rwrrrrr',
    'rrrrrrr',
    '.rrrrr.',
    '..rrr..',
    '...r...'
  ];

  MQ.Sprites = {
    build: function () {
      var s = { hero: {}, slime: {}, heart: null, heartEmpty: null, coin: null };
      Object.keys(HERO).forEach(function (k) { s.hero[k] = make(HERO[k], HERO_PALETTE, 2); });
      Object.keys(SLIME_COLORS).forEach(function (t) { s.slime[t] = make(SLIME, SLIME_COLORS[t], 2); });
      s.heart = make(HEART, { r: '#e63946', w: '#ff9aa2' }, 3);
      s.heartEmpty = make(HEART, { r: '#3b3b52', w: '#4a4a66' }, 3);
      return s;
    }
  };
})(globalThis.MQ = globalThis.MQ || {});
