require('dotenv').config();
const timestampsData = require('../../public/assets/audio/squamous-cell-lung-hypercalcemia-timestamps.json');

const ANTHROPIC_API_KEY = 'sk-ant-api03-6dQKKGKmhMXOVs0W8sCUL5nrzxLt4XfTqzhXNZLzXoJBwOmI_ydKA7hOMZ6xXaDFoYRJXbMz9lhzGKGzZx8b4w-9vIRSQAA';

const script = `MISS THIS and your patient DIES. Sixty two year old man. WEAK. PATHETIC. Can barely walk to the mailbox.
Forty pack years of smoking. That's two packs a day for twenty years for you youngsters who can't do math. Coughing up BLOOD for three months. Chest x-ray shows a big CRUSTY white mass. Right in the MIDDLE of his lung. Central location. FLAKY like old paint.
But wait. Gets BETTER. Calcium is fifteen point eight. Should be eight to ten. Kidneys working fine. Parathyroid hormone is LOW. Now that's PECULIAR as all get out.
So let's see what you got. A? Adenocarcinoma with bone mets. B? Small cell with SIADH. C? Hyperparathyroidism. D? Squamous cell with PTHrP. E? Large cell carcinoma. Clock's ticking...
Well SLAP MY KNEE, it's D. Squamous cell carcinoma. I bet you BAMBOOZLED fools picked adenocarcinoma. WRONG. Dead wrong. Adenocarcinomas hide in the CORNERS. This beast is DEAD CENTER.
Here's what you missed. Squamous cells DUMP out this ORNERY protein called PTHrP. Parathyroid hormone related peptide. This WRETCHED thing HIJACKS your bone cells. RIPS calcium straight out. FLOODS the bloodstream like a burst pipe. Patient gets weak, confused, constipated as a brick.
Remember this. Central mass plus high calcium equals squamous cell. Might save a life one day if you pay attention.
Now get out of here before I lose my temper.`;

const teachingOutline = `
Phase 1 - PTHrP Mechanism (flow-diagram):
  Squamous tumor → PTHrP release → Bone destruction → Calcium flood
  - Tumor cranks out PTHrP (fake parathyroid hormone)
  - PTHrP fools the body's calcium sensors
  - Activates osteoclasts in bone
  - Calcium ripped out of skeleton
  - Floods into bloodstream
  - Kidneys reabsorb more calcium (makes it worse)
  - Result: Life-threatening hypercalcemia

Phase 2 - Squamous vs Adeno (split-view):
  LEFT (Squamous Clues - Green):
  - CENTRAL location (key!)
  - Heavy smoking history
  - White, flaky, crusty appearance
  - Keratin pearls on microscopy
  - PTHrP production (causes hypercalcemia)

  RIGHT (Why NOT Adenocarcinoma - Red):
  - Adenocarcinomas are PERIPHERAL
  - More common in non-smokers
  - Glandular, mucinous appearance
  - Usually don't cause hypercalcemia
  - Different molecular profile (EGFR, KRAS)

Phase 3 - Boards Pearl (pearl-card):
  Central lung mass + Smoker (40+ pack-years) + High calcium + LOW PTH = SQUAMOUS CELL + PTHrP
`;

async function expandTeaching() {
  const prompt = `You are expanding a teaching outline into detailed JSON for a medical education video about squamous cell lung cancer with hypercalcemia.

Context:
- Topic: squamous-cell-lung-hypercalcemia
- Script: ${script}
- Timestamps: Available words array

Teaching outline to expand:
${teachingOutline}

Generate a detailed JSON array with exactly 3 phases. For each phase:

1. Determine exact startTime by finding the first relevant word in the script
2. Choose appropriate icons from: microscope, warning, lightbulb, bolt, chart, check, alert, stop, virus, pill
3. Write clear, concise text for each element (max 60 characters)
4. Add helpful subtext where appropriate
5. Match timestamps to specific words in narration (approximate based on script position)
6. For flow-diagram: alternate box/arrow, end with bullets
7. For split-view: balance left (good) vs right (bad) content
8. For pearl-card: build formula with + and = signs

Key words to use for timestamp matching:
- Phase 1 starts at "missed" (~73.4s)
- Phase 2 elements scattered through explanation (73-95s)
- Phase 3 starts at "Remember" (~95.7s)

Output ONLY valid JSON array format (no markdown, no explanation):
[
  {
    "titleText": "...",
    "startTime": ...,
    "layout": "flow-diagram" | "split-view" | "pearl-card",
    "elements": [...]
  },
  ...
]

Make it educational, engaging, and STEP-1 board-relevant.`;

  console.log('🤖 Calling Claude API to expand teaching outline...\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const contentText = data.content[0].text;

    // Extract JSON from response (remove markdown if present)
    let jsonText = contentText.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const teachingPhases = JSON.parse(jsonText);

    console.log('✅ Teaching phases expanded successfully!\n');
    console.log(JSON.stringify(teachingPhases, null, 2));

    return teachingPhases;
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

expandTeaching();
