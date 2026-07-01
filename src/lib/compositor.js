// Pure canvas helpers for capturing booth frames and assembling the final strip.
// These take DOM elements (video/canvas refs) as parameters instead of doing
// their own element lookups, so they stay framework-agnostic and testable.

export function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function drawCover(ctx, video, dx, dy, dw, dh) {
  if (!video || !video.videoWidth) return;
  const vw = video.videoWidth, vh = video.videoHeight;
  const scale = Math.max(dw / vw, dh / vh);
  const sw = dw / scale, sh = dh / scale;
  const sx = (vw - sw) / 2, sy = (vh - sh) / 2;
  ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
}

/**
 * Captures the current frame(s) into `workCanvas` and returns a JPEG dataURL.
 * Mirrors the original solo/duo side-by-side composite exactly.
 */
export function captureComposite({ mode, videoLocal, videoRemote, workCanvas, filterCss }) {
  const ctx = workCanvas.getContext('2d');

  if (mode === 'solo') {
    workCanvas.width = 480; workCanvas.height = 360;
    ctx.save();
    ctx.filter = filterCss;
    ctx.translate(workCanvas.width, 0);
    ctx.scale(-1, 1);
    drawCover(ctx, videoLocal, 0, 0, workCanvas.width, workCanvas.height);
    ctx.restore();
  } else {
    workCanvas.width = 640; workCanvas.height = 360;
    const half = workCanvas.width / 2;
    ctx.save();
    ctx.filter = filterCss;
    ctx.translate(half, 0);
    ctx.scale(-1, 1);
    drawCover(ctx, videoLocal, 0, 0, half, workCanvas.height);
    ctx.restore();

    ctx.save();
    ctx.filter = filterCss;
    if (videoRemote && videoRemote.videoWidth) {
      drawCover(ctx, videoRemote, half, 0, half, workCanvas.height);
    } else {
      ctx.fillStyle = '#0c0a08';
      ctx.fillRect(half, 0, half, workCanvas.height);
    }
    ctx.restore();

    ctx.fillStyle = '#E8391F';
    ctx.fillRect(half - 1, 0, 2, workCanvas.height);
  }
  return workCanvas.toDataURL('image/jpeg', 0.92);
}

const SHOTS_NEEDED = 3;

/**
 * Draws the three shots into `stripCanvas` using the chosen frame's styling
 * and resolves with the finished strip as a PNG dataURL.
 */
export function assembleStrip({ shots, frame, mode, sessionCode, stripCanvas }) {
  return new Promise((resolve) => {
    const ctx = stripCanvas.getContext('2d');
    const frameW = 560, frameH = 380, pad = 30, gap = 18, captionH = 90;
    stripCanvas.width = frameW + pad * 2;
    stripCanvas.height = pad * 2 + frameH * SHOTS_NEEDED + gap * (SHOTS_NEEDED - 1) + captionH;

    ctx.fillStyle = frame.paper;
    ctx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

    if (shots.length === 0) {
      resolve(stripCanvas.toDataURL('image/png'));
      return;
    }

    let loaded = 0;
    const imgs = shots.map((src) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === shots.length) renderStrip();
      };
      img.src = src;
      return img;
    });

    function renderStrip() {
      shots.forEach((s, i) => {
        const y = pad + i * (frameH + gap);
        ctx.fillStyle = '#0c0a08';
        ctx.fillRect(pad, y, frameW, frameH);
        ctx.drawImage(imgs[i], pad, y, frameW, frameH);

        if (frame.style === 'velvet') {
          ctx.strokeStyle = frame.border;
          ctx.lineWidth = 2;
          ctx.strokeRect(pad, y, frameW, frameH);
          ctx.strokeStyle = hexToRgba(frame.border, 0.55);
          ctx.lineWidth = 1;
          ctx.strokeRect(pad + 6, y + 6, frameW - 12, frameH - 12);
        } else if (frame.style === 'minimal') {
          ctx.strokeStyle = frame.border;
          ctx.lineWidth = 1;
          ctx.strokeRect(pad + 0.5, y + 0.5, frameW - 1, frameH - 1);
        } else {
          ctx.strokeStyle = frame.border;
          ctx.lineWidth = 2;
          ctx.strokeRect(pad, y, frameW, frameH);
        }
      });

      if (frame.style === 'deco') {
        const dSize = 7;
        const corners = [
          [pad - 2, pad - 2], [stripCanvas.width - pad + 2, pad - 2],
          [pad - 2, stripCanvas.height - captionH - 2], [stripCanvas.width - pad + 2, stripCanvas.height - captionH - 2],
        ];
        ctx.fillStyle = frame.border;
        corners.forEach(([cx, cy]) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-dSize / 2, -dSize / 2, dSize, dSize);
          ctx.restore();
        });
      }

      const capY = stripCanvas.height - captionH;
      ctx.strokeStyle = hexToRgba(frame.border, frame.style === 'minimal' ? 0.9 : 0.5);
      ctx.lineWidth = frame.style === 'minimal' ? 1 : 1.5;
      ctx.beginPath();
      ctx.moveTo(pad, capY + 14);
      ctx.lineTo(stripCanvas.width - pad, capY + 14);
      ctx.stroke();

      ctx.fillStyle = frame.caption;
      ctx.textAlign = 'center';
      ctx.font = '700 20px "Baloo 2", "Poppins", sans-serif';
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
      const modeLabel = mode === 'duo' ? 'DUO · ' + sessionCode : 'SOLO';
      ctx.fillText('PIX55 BOOTH · ' + dateStr + ' · ' + modeLabel, stripCanvas.width / 2, capY + 46);

      resolve(stripCanvas.toDataURL('image/png'));
    }
  });
}

export { SHOTS_NEEDED };
