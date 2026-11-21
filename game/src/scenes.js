/* Scene art for Three Little Worlds: three original scenes drawn procedurally.
 * One draw function per scene paints BOTH panels; each difference is a small
 * side-dependent detail, so the two pictures stay consistent and every
 * difference is fair. Panel space is 600 x 400 logical pixels. */
(function (global) {
  'use strict';

  /* ---------------- small drawing helpers ---------------- */

  function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function ellipse(ctx, x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  function poly(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  function star(ctx, x, y, r, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var rad = i % 2 === 0 ? r : r * 0.45;
      var a = (Math.PI * i) / points - Math.PI / 2;
      var px = x + Math.cos(a) * rad;
      var py = y + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function cloud(ctx, x, y, s) {
    ctx.fillStyle = '#ffffff';
    circle(ctx, x, y, 18 * s);
    circle(ctx, x + 18 * s, y - 6 * s, 22 * s);
    circle(ctx, x + 40 * s, y, 17 * s);
    ellipse(ctx, x + 20 * s, y + 8 * s, 34 * s, 12 * s);
  }

  function flower(ctx, x, y, petal, center) {
    ctx.fillStyle = petal;
    for (var i = 0; i < 5; i++) {
      var a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
      circle(ctx, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5);
    }
    ctx.fillStyle = center;
    circle(ctx, x, y, 4);
  }

  function tulip(ctx, x, y, color) {
    ctx.strokeStyle = '#2f7d32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x, y + 26);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 4);
    ctx.quadraticCurveTo(x - 9, y - 14, x - 4, y - 10);
    ctx.quadraticCurveTo(x, y - 16, x + 4, y - 10);
    ctx.quadraticCurveTo(x + 9, y - 14, x + 9, y - 4);
    ctx.quadraticCurveTo(x + 9, y + 8, x, y + 8);
    ctx.quadraticCurveTo(x - 9, y + 8, x - 9, y - 4);
    ctx.fill();
  }

  function butterfly(ctx, x, y, s, wing) {
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.ellipse(x - 8 * s, y, 9 * s, 6 * s, -0.5, 0, Math.PI * 2);
    ctx.ellipse(x + 8 * s, y, 9 * s, 6 * s, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b3a8c';
    ctx.fillRect(x - 1.5 * s, y - 7 * s, 3 * s, 14 * s);
    ctx.fillStyle = '#ffffff';
    circle(ctx, x - 8 * s, y - 1 * s, 2 * s);
    circle(ctx, x + 8 * s, y - 1 * s, 2 * s);
  }

  function sittingCat(ctx, x, y, tailUp, coat) {
    ctx.fillStyle = coat;
    ellipse(ctx, x, y, 20, 24); // body
    circle(ctx, x + 2, y - 28, 14); // head
    poly(ctx, [[x - 8, y - 36], [x - 12, y - 48], [x - 1, y - 40]]); // ear L
    poly(ctx, [[x + 10, y - 38], [x + 15, y - 49], [x + 15, y - 36]]); // ear R
    ctx.strokeStyle = coat;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (tailUp) {
      ctx.moveTo(x - 18, y + 16);
      ctx.quadraticCurveTo(x - 34, y + 8, x - 30, y - 12);
    } else {
      ctx.moveTo(x - 18, y + 16);
      ctx.quadraticCurveTo(x - 36, y + 20, x - 40, y + 26);
    }
    ctx.stroke();
    ctx.fillStyle = '#2b2118';
    circle(ctx, x - 3, y - 30, 2);
    circle(ctx, x + 7, y - 30, 2);
  }

  function gull(ctx, x, y, s) {
    ctx.strokeStyle = '#2c2c34';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 10 * s, y);
    ctx.quadraticCurveTo(x - 4 * s, y - 7 * s, x, y);
    ctx.quadraticCurveTo(x + 4 * s, y - 7 * s, x + 10 * s, y);
    ctx.stroke();
  }

  /* ---------------- LEVEL 1 : Morning Garden (7 differences) ---------------- */

  function drawGarden(ctx, side) {
    // Sky
    var sky = ctx.createLinearGradient(0, 0, 0, 280);
    sky.addColorStop(0, '#8ed0f0');
    sky.addColorStop(1, '#eaf9ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 600, 280);
    // Sun with a different number of rays on each side
    ctx.fillStyle = '#ffd94d';
    circle(ctx, 90, 70, 34);
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    var rays = side === 0 ? 8 : 5;
    for (var i = 0; i < rays; i++) {
      var a = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(90 + Math.cos(a) * 42, 70 + Math.sin(a) * 42);
      ctx.lineTo(90 + Math.cos(a) * 56, 70 + Math.sin(a) * 56);
      ctx.stroke();
    }
    ctx.fillStyle = '#fff3c4';
    circle(ctx, 90, 70, 22);
    // Clouds — one cloud only exists on the left panel
    cloud(ctx, 200, 55, 0.9);
    cloud(ctx, 330, 38, 0.6);
    if (side === 0) cloud(ctx, 470, 60, 1.0);
    // Hills
    ctx.fillStyle = '#7cc46a';
    ellipse(ctx, 140, 330, 260, 90);
    ctx.fillStyle = '#68b357';
    ellipse(ctx, 480, 340, 280, 100);
    // House
    ctx.fillStyle = '#f6d9a0';
    ctx.fillRect(390, 190, 130, 110);
    ctx.fillStyle = '#c65b4e';
    poly(ctx, [[380, 192], [455, 140], [530, 192]]);
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(440, 248, 30, 52);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(402, 210, 30, 30);
    ctx.fillRect(478, 210, 30, 30);
    ctx.strokeStyle = '#7a4a21';
    ctx.lineWidth = 2;
    ctx.strokeRect(402, 210, 30, 30);
    ctx.strokeRect(478, 210, 30, 30);
    // Tree
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(72, 210, 18, 80);
    ctx.fillStyle = '#3f9142';
    circle(ctx, 81, 185, 42);
    circle(ctx, 48, 205, 28);
    circle(ctx, 116, 205, 28);
    ctx.fillStyle = '#e2574c';
    circle(ctx, 60, 175, 6);
    circle(ctx, 100, 160, 6);
    circle(ctx, 118, 195, 6);
    // Fence — one picket is shorter on the right panel
    ctx.fillStyle = '#b98a56';
    ctx.fillRect(20, 296, 560, 8);
    ctx.fillRect(20, 316, 560, 8);
    for (var px = 28; px <= 568; px += 30) {
      var tall = side === 0 || px !== 478;
      ctx.fillRect(px, tall ? 282 : 296, 10, tall ? 46 : 32);
      poly(ctx, [[px, tall ? 282 : 296], [px + 5, (tall ? 282 : 296) - 8], [px + 10, tall ? 282 : 296]]);
    }
    // Flower bed
    ctx.fillStyle = '#5da24e';
    ctx.fillRect(0, 340, 600, 60);
    flower(ctx, 60, 362, '#ff7eb6', '#ffd94d');
    flower(ctx, 120, 372, '#ffffff', '#ff9d00');
    flower(ctx, 180, 360, '#b388ff', '#fff3c4');
    flower(ctx, 250, 372, '#ff7eb6', '#ffd94d');
    tulip(ctx, 330, 330, side === 0 ? '#e23b3b' : '#ffd94d'); // tulip changes colour
    flower(ctx, 400, 368, '#ffffff', '#ff9d00');
    flower(ctx, 460, 360, '#b388ff', '#fff3c4');
    // Pond with lily pads — one pad fewer on the right panel
    ctx.fillStyle = '#5fb8d8';
    ellipse(ctx, 520, 362, 56, 18);
    ctx.fillStyle = '#3f9142';
    ellipse(ctx, 500, 360, 12, 5);
    ellipse(ctx, 524, 366, 12, 5);
    if (side === 0) ellipse(ctx, 544, 358, 12, 5);
    ctx.fillStyle = '#ff9ecf';
    circle(ctx, 524, 362, 3);
    // Cat — its tail points up on the left, down on the right
    sittingCat(ctx, 150, 330, side === 0, '#f2a541');
    // Butterfly — only on the left panel
    if (side === 0) butterfly(ctx, 210, 180, 1, '#ff8fd0');
  }

  /* ---------------- LEVEL 2 : Harbor at Dusk (10 differences) ---------------- */

  function drawHarbor(ctx, side) {
    // Dusk sky
    var sky = ctx.createLinearGradient(0, 0, 0, 240);
    sky.addColorStop(0, '#3b2b5e');
    sky.addColorStop(0.6, '#8a4a7a');
    sky.addColorStop(1, '#e2703a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 600, 240);
    // Moon — three craters on the left, one on the right
    ctx.fillStyle = '#fdf6d8';
    circle(ctx, 520, 60, 26);
    ctx.fillStyle = '#d9cfa8';
    circle(ctx, 512, 54, 5);
    circle(ctx, 528, 66, 4);
    if (side === 0) circle(ctx, 524, 48, 3);
    // Gulls — three on the left, two on the right
    gull(ctx, 280, 80, 1);
    gull(ctx, 320, 66, 0.9);
    if (side === 0) gull(ctx, 350, 88, 0.8);
    // Sea
    var sea = ctx.createLinearGradient(0, 240, 0, 400);
    sea.addColorStop(0, '#2a4a6b');
    sea.addColorStop(1, '#16324a');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 240, 600, 160);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    for (var wy = 260; wy <= 380; wy += 30) {
      ctx.beginPath();
      for (var wx = 0; wx <= 600; wx += 40) {
        var yy = wy + Math.sin(wx / 60 + wy) * 3;
        if (wx === 0) ctx.moveTo(wx, yy); else ctx.lineTo(wx, yy);
      }
      ctx.stroke();
    }
    // Lighthouse
    ctx.fillStyle = '#f2ede0';
    ctx.fillRect(66, 120, 48, 120);
    ctx.fillStyle = '#c65b4e';
    ctx.fillRect(66, 150, 48, 16);
    ctx.fillRect(66, 190, 48, 16);
    ctx.fillStyle = '#3b2b5e';
    ctx.fillRect(60, 100, 60, 22);
    ctx.fillStyle = '#ffe9a8';
    ctx.fillRect(72, 104, 36, 14);
    ctx.fillStyle = '#3b2b5e';
    poly(ctx, [[58, 100], [90, 82], [122, 100]]);
    // Light beam — only on the left panel
    if (side === 0) {
      var beam = ctx.createLinearGradient(120, 111, 420, 111);
      beam.addColorStop(0, 'rgba(255,233,168,0.85)');
      beam.addColorStop(1, 'rgba(255,233,168,0)');
      ctx.fillStyle = beam;
      poly(ctx, [[120, 104], [420, 70], [420, 152], [120, 118]]);
    }
    // Rocky base
    ctx.fillStyle = '#5a5a66';
    poly(ctx, [[40, 240], [140, 240], [128, 214], [52, 214]]);
    // Sailboat
    ctx.fillStyle = '#7a4a21';
    poly(ctx, [[360, 250], [480, 250], [460, 272], [380, 272]]);
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(416, 150, 6, 100);
    // Sail — striped on the left, plain on the right
    ctx.fillStyle = '#fdf6e3';
    poly(ctx, [[424, 158], [424, 244], [478, 244]]);
    if (side === 0) {
      ctx.fillStyle = '#e2574c';
      poly(ctx, [[424, 186], [424, 202], [452, 202], [440, 186]]);
      poly(ctx, [[424, 218], [424, 234], [468, 234], [456, 218]]);
    }
    // Flag — red on the left, blue on the right
    ctx.fillStyle = side === 0 ? '#e23b3b' : '#3b7de2';
    poly(ctx, [[422, 150], [448, 158], [422, 166]]);
    // Cabin window — lit on the left, dark on the right
    ctx.fillStyle = side === 0 ? '#ffe9a8' : '#2c2c34';
    ctx.fillRect(428, 228, 16, 12);
    // Small rowboat
    ctx.fillStyle = '#5a7d4a';
    ellipse(ctx, 250, 268, 34, 10);
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(244, 252, 4, 14);
    ctx.fillRect(258, 252, 4, 14);
    // Pier
    ctx.fillStyle = '#8a6a42';
    ctx.fillRect(300, 300, 280, 14);
    ctx.fillStyle = '#6b4f30';
    for (var px2 = 310; px2 < 580; px2 += 28) ctx.fillRect(px2, 300, 3, 14);
    ctx.fillStyle = '#5a4630';
    ctx.fillRect(320, 314, 10, 46);
    ctx.fillRect(540, 314, 10, 46);
    // Crates — three on the left, two on the right
    ctx.fillStyle = '#c99a4a';
    ctx.fillRect(508, 272, 28, 28);
    ctx.fillRect(538, 272, 28, 28);
    if (side === 0) ctx.fillRect(523, 244, 28, 28);
    ctx.strokeStyle = '#7a5a20';
    ctx.lineWidth = 2;
    ctx.strokeRect(508, 272, 28, 28);
    ctx.strokeRect(538, 272, 28, 28);
    if (side === 0) ctx.strokeRect(523, 244, 28, 28);
    // Lantern on a pier post — glowing on the left, dark on the right
    ctx.fillStyle = '#5a4630';
    ctx.fillRect(346, 268, 6, 32);
    if (side === 0) {
      var glow = ctx.createRadialGradient(349, 262, 2, 349, 262, 26);
      glow.addColorStop(0, 'rgba(255,220,120,0.8)');
      glow.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = glow;
      circle(ctx, 349, 262, 26);
    }
    ctx.fillStyle = side === 0 ? '#ffd94d' : '#4a4a55';
    circle(ctx, 349, 262, 8);
    ctx.fillStyle = '#2c2c34';
    ctx.fillRect(343, 252, 12, 4);
    // Rope coil — only on the left panel
    if (side === 0) {
      ctx.strokeStyle = '#d9b06a';
      ctx.lineWidth = 4;
      circle(ctx, 250, 330, 14);
      ctx.beginPath();
      ctx.arc(250, 330, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Jumping fish — only on the left panel
    if (side === 0) {
      ctx.fillStyle = '#9fd8ef';
      ctx.beginPath();
      ctx.ellipse(180, 340, 14, 6, -0.6, 0, Math.PI * 2);
      ctx.fill();
      poly(ctx, [[168, 336], [158, 330], [166, 342]]);
      ctx.fillStyle = '#2b2118';
      circle(ctx, 188, 336, 1.6);
    }
  }

  /* ---------------- LEVEL 3 : Night Market (12 differences) ---------------- */

  function drawMarket(ctx, side) {
    // Night sky
    var sky = ctx.createLinearGradient(0, 0, 0, 220);
    sky.addColorStop(0, '#10142a');
    sky.addColorStop(1, '#2c2350');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 600, 220);
    // Stars — one star only on the left panel
    ctx.fillStyle = '#ffffff';
    var stars = [[40, 30], [150, 44], [220, 26], [330, 40], [420, 30], [480, 52], [90, 90], [380, 80]];
    for (var si = 0; si < stars.length; si++) star(ctx, stars[si][0], stars[si][1], 4, 5);
    if (side === 0) star(ctx, 80, 50, 5, 5);
    // Moon — smiling on the left, plain on the right
    ctx.fillStyle = '#fdf6d8';
    circle(ctx, 540, 50, 24);
    if (side === 0) {
      ctx.fillStyle = '#2b2118';
      circle(ctx, 532, 46, 2);
      circle(ctx, 548, 46, 2);
      ctx.strokeStyle = '#2b2118';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(540, 52, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
    // String lights across the top — one bulb dark on the right
    ctx.strokeStyle = '#3a2d20';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 70);
    ctx.quadraticCurveTo(300, 130, 600, 70);
    ctx.stroke();
    var bulbs = [60, 130, 200, 250, 320, 390, 460, 540];
    for (var bi = 0; bi < bulbs.length; bi++) {
      var bx = bulbs[bi];
      var by = 70 + Math.sin((bx / 600) * Math.PI) * 34 + 8;
      var dark = side === 1 && bx === 250;
      ctx.fillStyle = dark ? '#4a4a55' : ['#ffd94d', '#ff8fa3', '#8fd8ff'][bi % 3];
      circle(ctx, bx, by, 6);
      if (!dark) {
        ctx.fillStyle = 'rgba(255,217,77,0.25)';
        circle(ctx, bx, by, 11);
      }
    }
    // Ground
    ctx.fillStyle = '#3a2d20';
    ctx.fillRect(0, 330, 600, 70);
    ctx.fillStyle = '#4a3826';
    ctx.fillRect(0, 330, 600, 6);
    // Cobbles and a woven mat in front of the stalls
    ctx.fillStyle = '#54402c';
    for (var cb = 0; cb < 8; cb++) ellipse(ctx, 40 + cb * 74, 372, 22, 6);
    ctx.fillStyle = '#a33c2e';
    rrect(ctx, 240, 348, 130, 34, 6);
    ctx.strokeStyle = '#ffd94d';
    ctx.lineWidth = 2;
    ctx.strokeRect(248, 354, 114, 22);
    ctx.fillStyle = '#ffd94d';
    star(ctx, 305, 365, 7, 5);
    // Left stall with striped awning — five stripes left, four right
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(60, 210, 180, 120);
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(60, 210, 180, 26);
    ctx.fillStyle = '#e2574c';
    var stripes = side === 0 ? 5 : 4;
    for (var st = 0; st < stripes; st++) ctx.fillRect(60 + st * 36, 210, 18, 26);
    ctx.fillStyle = '#f6d9a0';
    ctx.fillRect(60, 236, 180, 12);
    // Hanging lantern — red on the left, green on the right
    ctx.strokeStyle = '#3a2d20';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 236);
    ctx.lineTo(120, 140);
    ctx.stroke();
    ctx.fillStyle = side === 0 ? '#e23b3b' : '#3f9142';
    ellipse(ctx, 120, 152, 14, 18);
    ctx.fillStyle = '#ffd94d';
    ctx.fillRect(114, 132, 12, 5);
    ctx.fillRect(114, 168, 12, 5);
    // Second lantern (same on both sides)
    ctx.beginPath();
    ctx.moveTo(200, 236);
    ctx.lineTo(200, 150);
    ctx.stroke();
    ctx.fillStyle = '#ffd94d';
    ellipse(ctx, 200, 162, 12, 15);
    // Cat on the left stall counter — only on the left panel
    if (side === 0) sittingCat(ctx, 180, 300, true, '#3a3a44');
    // Middle vendor cart
    ctx.fillStyle = '#5a4630';
    ctx.fillRect(280, 230, 90, 100);
    ctx.fillStyle = '#c65b4e';
    poly(ctx, [[272, 232], [325, 196], [378, 232]]);
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(280, 232, 90, 14);
    // Vendor — hat only on the left panel
    ctx.fillStyle = '#f2c89b';
    circle(ctx, 300, 150, 16);
    ctx.fillStyle = '#2b2118';
    circle(ctx, 294, 148, 2);
    circle(ctx, 306, 148, 2);
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(300, 154, 6, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    if (side === 0) {
      ctx.fillStyle = '#e8b13c';
      ellipse(ctx, 300, 138, 20, 6);
      poly(ctx, [[286, 138], [300, 116], [314, 138]]);
    }
    ctx.fillStyle = '#3f7d4a';
    ctx.fillRect(282, 168, 36, 30);
    // Sign on the cart — TEH on the left, KOPI on the right
    ctx.fillStyle = '#fdf6e3';
    rrect(ctx, 286, 218, 68, 26, 5);
    ctx.fillStyle = '#2b2118';
    ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(side === 0 ? 'TEH' : 'KOPI', 320, 232);
    // Right stall
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(400, 210, 170, 120);
    ctx.fillStyle = '#fdf6e3';
    ctx.fillRect(400, 210, 170, 26);
    ctx.fillStyle = '#3b7de2';
    for (var st2 = 0; st2 < 4; st2++) ctx.fillRect(400 + st2 * 42, 210, 21, 26);
    ctx.fillStyle = '#f6d9a0';
    ctx.fillRect(400, 236, 170, 12);
    // Umbrella over the right stall — red stripes left, blue right
    ctx.fillStyle = side === 0 ? '#e23b3b' : '#3b7de2';
    ctx.beginPath();
    ctx.arc(485, 190, 52, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fdf6e3';
    poly(ctx, [[459, 190], [473, 190], [466, 146]]);
    poly(ctx, [[497, 190], [511, 190], [504, 146]]);
    ctx.strokeStyle = '#3a2d20';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(485, 140);
    ctx.lineTo(485, 210);
    ctx.stroke();
    // Basket of oranges — five on the left, four on the right
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(408, 300, 56, 22);
    ctx.fillStyle = '#ff9d00';
    circle(ctx, 418, 296, 8);
    circle(ctx, 436, 292, 8);
    circle(ctx, 454, 296, 8);
    if (side === 0) circle(ctx, 427, 284, 8);
    circle(ctx, 445, 284, 8);
    ctx.fillStyle = '#3f9142';
    circle(ctx, 436, 286, 3);
    // Fish on ice — only on the left panel
    if (side === 0) {
      ctx.fillStyle = '#cfe8f2';
      rrect(ctx, 372, 322, 60, 16, 4);
      ctx.fillStyle = '#9fd8ef';
      ctx.beginPath();
      ctx.ellipse(402, 330, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      poly(ctx, [[388, 330], [378, 324], [386, 336]]);
    }
    // Balloons — four on the left, three on the right
    var balloonCols = ['#e23b3b', '#ffd94d', '#3b7de2', '#b388ff'];
    var balloonXs = [500, 524, 548, 566];
    for (var bl = 0; bl < balloonXs.length; bl++) {
      if (side === 1 && bl === 3) continue;
      ctx.fillStyle = balloonCols[bl];
      ellipse(ctx, balloonXs[bl], 108 + (bl % 2) * 14, 11, 14);
      ctx.strokeStyle = '#3a2d20';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(balloonXs[bl], 122 + (bl % 2) * 14);
      ctx.quadraticCurveTo(balloonXs[bl] + 6, 150, balloonXs[bl], 168);
      ctx.stroke();
    }
  }

  /* ---------------- level table ---------------- */

  var LEVELS = [
    {
      id: 'garden',
      name: 'Morning Garden',
      subtitle: 'A sunny garden with a house, a tree and a very patient cat.',
      timeLimit: 150,
      diffs: [
        { id: 'sun-rays', x: 90, y: 70, label: 'Sun rays' },
        { id: 'cloud', x: 470, y: 60, label: 'Cloud' },
        { id: 'tulip', x: 330, y: 330, label: 'Tulip colour' },
        { id: 'butterfly', x: 210, y: 180, label: 'Butterfly' },
        { id: 'cat-tail', x: 150, y: 330, label: 'Cat tail' },
        { id: 'picket', x: 483, y: 300, label: 'Fence picket' },
        { id: 'lily', x: 544, y: 358, label: 'Lily pad' }
      ],
      draw: drawGarden
    },
    {
      id: 'harbor',
      name: 'Harbor at Dusk',
      subtitle: 'A lighthouse, two boats and a sea that keeps its secrets.',
      timeLimit: 180,
      diffs: [
        { id: 'beam', x: 200, y: 110, label: 'Lighthouse beam' },
        { id: 'moon', x: 520, y: 60, label: 'Moon craters' },
        { id: 'gull', x: 350, y: 88, label: 'Seagull' },
        { id: 'flag', x: 435, y: 158, label: 'Boat flag' },
        { id: 'crates', x: 537, y: 258, label: 'Crate stack' },
        { id: 'lantern', x: 349, y: 262, label: 'Pier lantern' },
        { id: 'rope', x: 250, y: 330, label: 'Rope coil' },
        { id: 'fish', x: 180, y: 340, label: 'Jumping fish' },
        { id: 'sail', x: 445, y: 200, label: 'Sail stripes' },
        { id: 'window', x: 436, y: 234, label: 'Cabin window' }
      ],
      draw: drawHarbor
    },
    {
      id: 'market',
      name: 'Night Market',
      subtitle: 'Lanterns, balloons and a vendor who sells TEH — or is it KOPI?',
      timeLimit: 210,
      diffs: [
        { id: 'lantern', x: 120, y: 152, label: 'Lantern colour' },
        { id: 'balloons', x: 566, y: 122, label: 'Balloon' },
        { id: 'hat', x: 300, y: 130, label: 'Vendor hat' },
        { id: 'cat', x: 180, y: 300, label: 'Stall cat' },
        { id: 'star', x: 80, y: 50, label: 'Star' },
        { id: 'sign', x: 320, y: 232, label: 'Sign word' },
        { id: 'oranges', x: 427, y: 284, label: 'Orange' },
        { id: 'umbrella', x: 485, y: 165, label: 'Umbrella' },
        { id: 'bulb', x: 250, y: 100, label: 'String bulb' },
        { id: 'moon', x: 540, y: 50, label: 'Moon smile' },
        { id: 'awning', x: 204, y: 223, label: 'Awning stripe' },
        { id: 'fish', x: 402, y: 330, label: 'Fish on ice' }
      ],
      draw: drawMarket
    }
  ];

  global.LEVELS = LEVELS;
  global.SCENE_PANEL_W = 600;
  global.SCENE_PANEL_H = 400;
})(window);
