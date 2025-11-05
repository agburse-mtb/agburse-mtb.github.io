document.addEventListener("DOMContentLoaded", function() {
  const counterText = document.getElementById("counterText");
  const releaseTableBody = document.querySelector('#releaseTable tbody');
  const releaseStats = document.getElementById('releaseStats');

  // Set the date for October 1st, 2025
  const octoberFirst = new Date("2025-10-01");

  function updateCounter() {
    // Get the current date and time
    const now = new Date();

    // Calculate the difference in time
    const differenceInTime = now.getTime() - octoberFirst.getTime();

    // Calculate days, hours, minutes, and seconds
    const days = Math.floor(differenceInTime / (1000 * 3600 * 24));
    const hours = Math.floor((differenceInTime % (1000 * 3600 * 24)) / (1000 * 3600));
    const minutes = Math.floor((differenceInTime % (1000 * 3600)) / (1000 * 60));
    const seconds = Math.floor((differenceInTime % (1000 * 60)) / 1000);

    // Update the HTML element with the calculated values in the desired format
    counterText.textContent = `Das MTB ist schon ${days} Tage, ${hours} Stunden, ${minutes} Minuten und ${seconds} Sekunden zu spät!`;
  }

  // Call updateCounter initially to start the counter immediately
  updateCounter();

  // Update the counter every second
  setInterval(updateCounter, 1000);

  // ----- Release delays overview -----
  const releases = [
    { label: "WS 24/25", actual: "31.03.2025" },
    { label: "SS 24", actual: "10.11.2024" },
    { label: "WS 23/24", actual: "31.03.2024" },
    { label: "SS 23", actual: "24.11.2023" },
    { label: "WS 22/23", actual: "20.04.2023" },
    { label: "SS 22", actual: "03.10.2022" },
    { label: "WS 21/22", actual: "04.04.2022" },
    { label: "SS 21", actual: "16.10.2021" },
    { label: "WS 20/21", actual: "10.05.2021" },
    { label: "SS 20", actual: "05.11.2020" },
    { label: "WS 19/20", actual: "15.04.2020" },
  ];

  function getCurrentSemester(nowUtc) {
    const year = nowUtc.getUTCFullYear();
    const octFirst = new Date(Date.UTC(year, 9, 1)); // Oct 1 current year
    if (nowUtc >= octFirst) {
      // Current is SS of current year (planned Oct 1 current year)
      return {
        label: `SS ${String(year).slice(-2)}`,
        planned: new Date(Date.UTC(year, 9, 1))
      };
    }
    // Otherwise, current is WS prev/curr (planned Apr 1 current year)
    const prevYY = String((year - 1)).slice(-2);
    const currYY = String(year).slice(-2);
    return {
      label: `WS ${prevYY}/${currYY}`,
      planned: new Date(Date.UTC(year, 3, 1))
    };
  }

  function parseGermanDate(dateStr) {
    const parts = dateStr.trim().split(".");
    if (parts.length < 3) return null;
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    let y = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
    return new Date(Date.UTC(y, m - 1, d));
  }

  function formatDateDDMMYYYY(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${d}.${m}.${y}`;
  }

  function plannedDateForLabel(label) {
    const trimmed = label.replace(/\s+/g, ' ').trim();
    // WS: planned 01.04 of the later year; SS: planned 01.10 of the same year
    if (/\//.test(trimmed) || /^\s*WS/i.test(trimmed)) {
      const match = trimmed.match(/(\d{2})\s*\/\s*(\d{2})/);
      if (match) {
        const laterYY = parseInt(match[2], 10);
        const laterYear = 2000 + laterYY;
        return new Date(Date.UTC(laterYear, 3, 1)); // April (month 3)
      }
      const yearMatch = trimmed.match(/(20\d{2}|\d{2})/);
      if (yearMatch) {
        const yRaw = yearMatch[1];
        const y = yRaw.length === 2 ? 2000 + parseInt(yRaw, 10) : parseInt(yRaw, 10);
        return new Date(Date.UTC(y + 1, 3, 1));
      }
    }
    const yearMatch = trimmed.match(/(20\d{2}|\d{2})/);
    if (yearMatch) {
      const yRaw = yearMatch[1];
      const y = yRaw.length === 2 ? 2000 + parseInt(yRaw, 10) : parseInt(yRaw, 10);
      return new Date(Date.UTC(y, 9, 1)); // October (month 9)
    }
    return null;
  }

  function daysBetweenUTC(a, b) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = a.getTime() - b.getTime();
    return Math.round(diff / msPerDay);
  }

  function computeStats(values) {
    const sorted = [...values].sort((x, y) => x - y);
    const n = sorted.length;
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = n ? sum / n : 0;
    const median = n ? (n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2) : 0;
    const min = n ? sorted[0] : 0;
    const max = n ? sorted[n - 1] : 0;
    return { n, mean, median, min, max };
  }

  function renderReleases() {
    if (!releaseTableBody || !releaseStats) return;

    const rows = [];
    const delaysAll = [];
    const delaysWS = [];
    const delaysSS = [];

    // Add dynamic current semester (unpublished)
    const nowUtc = new Date();
    const current = getCurrentSemester(nowUtc);
    const releasesWithCurrent = [
      { label: current.label, actual: null, plannedOverride: current.planned },
      ...releases
    ];

    for (const item of releasesWithCurrent) {
      const isWS = /\//.test(item.label) || /^\s*WS/i.test(item.label);
      const planned = item.plannedOverride || plannedDateForLabel(item.label);
      if (!planned) continue;
      const actual = item.actual ? parseGermanDate(item.actual) : null;
      const effectiveActual = actual || nowUtc; // compute delay to today if unpublished
      const delayDays = daysBetweenUTC(effectiveActual, planned);

      delaysAll.push(delayDays);
      (isWS ? delaysWS : delaysSS).push(delayDays);

      rows.push({ label: item.label, planned, actual, delayDays });
    }

    rows.sort((a, b) => b.planned - a.planned);

    releaseTableBody.innerHTML = rows.map(r => {
      const delayColor = r.delayDays > 0 ? '#b30000' : (r.delayDays === 0 ? '#444' : '#0a7b00');
      return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px transparent #ddd;">${r.label}</td>
          <td style="padding: 8px; border-bottom: 1px transparent #ddd;">${formatDateDDMMYYYY(r.planned)}</td>
          <td style="padding: 8px; border-bottom: 1px transparent #ddd;">${r.actual ? formatDateDDMMYYYY(r.actual) : '<em>nicht veröffentlicht</em>'}</td>
          <td style=\"padding: 8px; border-bottom: 1px transparent #ddd; text-align: right; color: ${delayColor};\">${r.delayDays}</td>
        </tr>
      `;
    }).join('');

    const overall = computeStats(delaysAll);
    const wsStats = computeStats(delaysWS);
    const ssStats = computeStats(delaysSS);

    function fmt(num) { return Math.round(num * 10) / 10; }

    releaseStats.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
        <div><strong>Gesamt</strong>: n=${overall.n}, Mittel=${fmt(overall.mean)} T., Median=${fmt(overall.median)} T., Min=${overall.min} T., Max=${overall.max} T.</div>
        <div><strong>WS</strong>: n=${wsStats.n}, Mittel=${fmt(wsStats.mean)} T., Median=${fmt(wsStats.median)} T., Min=${wsStats.min} T., Max=${wsStats.max} T.</div>
        <div><strong>SS</strong>: n=${ssStats.n}, Mittel=${fmt(ssStats.mean)} T., Median=${fmt(ssStats.median)} T., Min=${ssStats.min} T., Max=${ssStats.max} T.</div>
      </div>
      <div style="margin-top: 6px; color: #555;">Verzug = veröffentlichter Tag minus geplanter Stichtag (positiv = zu spät).</div>
    `;
  }

  renderReleases();
});


document.querySelectorAll('.floating-cat').forEach(cat => {
  cat.style.left = Math.random() * window.innerWidth + 'px';
  cat.style.top = Math.random() * window.innerHeight + 'px';
});

