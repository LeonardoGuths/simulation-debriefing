const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'logs');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const instruments = ['steto', 'otoscope', 'stick'];
const questions = [
  'Faz algum exercício físico?',
  'Tem alergias alimentares?',
  'Você fuma?',
  'Está tomando algum medicamento?',
  'Tem histórico familiar relevante?',
  'Sente dor atualmente?',
  'Houve perda de peso recente?'
];

for (let i = 0; i < 26; i++) {
  const letter = String.fromCharCode(65 + i);
  const id = `student-${letter}`;
  const name = `Student ${letter}`;
  const duration = 300 + i * 10; // 300s .. 550s (5..9+ minutes)
  const events = [];

  // station start at time 0
  events.push(`observation: 0.00000, station_start`);

  // instrument interactions every 30s until near the end
  const interval = 30;
  let idx = 0;
  for (let t = interval; t <= duration - 60; t += interval) {
    const instr = instruments[(i + idx) % instruments.length];
    // occasional pre-note
    if (idx % 3 === 0) {
      events.push(`observation: ${t.toFixed(5)}, Using ${instr} before hygiene`);
      // small extra note
      events.push(`observation: ${t.toFixed(5)}, Using ${instr} before anamnesis`);
    }
    events.push(`observation: ${t.toFixed(5)}, ${instr}_start`);
    events.push(`observation: ${(t + 6.0).toFixed(5)}, ${instr}_end`);

    // gloves script around first instrument
    if (idx === 0) {
      events.push(`observation: ${(t + 7.2).toFixed(5)}, glovesScript_start`);
      events.push(`observation: ${(t + 8.2).toFixed(5)}, glovesScript_end`);
    }

    // occasional alert
    if (idx % 4 === 2) {
      events.push(`observation: ${(t + 12.5).toFixed(5)}, alert: minor_alert_${idx}`);
    }

    idx++;
  }

  // anamnesis somewhere mid-station
  const anamTime = Math.round(duration * 0.45 * 100) / 100; // 45% through
  events.push(`observation: ${anamTime.toFixed(5)}, anamnesis: ${questions[i % questions.length]}`);

  // a couple more actions after anamnesis
  events.push(`observation: ${(anamTime + 10.25).toFixed(5)}, steto_start`);
  events.push(`observation: ${(anamTime + 16.75).toFixed(5)}, steto_end`);

  // diagnosis and treatment markers near the end
  const finish = duration;
  events.push(`observation: ${finish.toFixed(5)}, correctDiagnosis_start`);
  events.push(`observation: ${finish.toFixed(5)}, correctDiagnosis_end`);
  events.push(`observation: ${finish.toFixed(5)}, correctTreatment_start`);
  events.push(`observation: ${finish.toFixed(5)}, correctTreatment_end`);
  events.push(`observation: ${finish.toFixed(5)}, station_end`);

  const out = {
    id,
    name,
    duration,
    log: events.join('\n')
  };

  const filename = path.join(outDir, `${id}.json`);
  fs.writeFileSync(filename, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', filename);
}

console.log('All logs generated in', outDir);
