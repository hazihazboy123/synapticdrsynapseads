import React from 'react';
import { Composition, staticFile } from 'remotion';
import { MedicalVideoAd } from './components/MedicalVideoAd';
import { FluoroquinoloneAd } from './components/FluoroquinoloneAd';
import { MucormycosisAd } from './components/MucormycosisAd';
import { DesquamativeAd } from './components/DesquamativeAd';
import { LegionellaAd } from './components/LegionellaAd';
import { SquamousCellLungCarcinomaAd } from './components/SquamousCellLungCarcinomaAd';
import { SquamousCellLungCarcinomaAdV2 } from './components/SquamousCellLungCarcinomaAdV2';
import { WernickeAd } from './components/WernickeAd';
import { AspirationPneumoniaAd } from './components/AspirationPneumoniaAd';
import { PyrazinamideAd } from './components/PyrazinamideAd';
import { SquamousCellLungHypercalcemiaAd } from './components/SquamousCellLungHypercalcemiaAd';
import { NephroticSyndromeMinimalChangeAd } from './components/NephroticSyndromeMinimalChangeAd';
import { PseudomonasEcthymaGangrenosumAd } from './components/PseudomonasEcthymaGangrenosumAd';
import { BphFiveAlphaReductaseAd } from './components/BphFiveAlphaReductaseAd';
import { StreptococcusPneumoniaeLobarPneumoniaAd } from './components/StreptococcusPneumoniaeLobarPneumoniaAd';

export const RemotionRoot = () => {
  return (
    <>
      {/* Original Sarcoidosis Ad */}
      <Composition
        id="SynapticRecallAd"
        component={MedicalVideoAd}
        durationInFrames={2684}  // 89.5 seconds at 30fps (156.58s / 1.75x playback)
        fps={30}
        width={1080}            // TikTok/Instagram vertical format
        height={1920}
        defaultProps={{
          audioPath: staticFile('assets/audio/narration.mp3'),

          // Script content for text overlays
          script: {
            hook: "38-year-old woman\nCan't breathe\nCalcium: 11.2 ↑",
            findings: [
              "Ankle pain",
              "Erythema nodosum",
              "Uveitis",
              "Bilateral hilar lymphadenopathy",
              "Noncaseating granulomas"
            ],
            labHighlight: "Calcium: 11.2\n(Normal: 8.5-10)",
            question: "Which mechanism?",
            reveal: "SARCOIDOSIS",
            explanation: "Granulomas → 1-alpha-hydroxylase\n→ Active Vitamin D ↑\n→ Calcium absorption ↑"
          },

          // No memes - just background and audio
          memes: []
        }}
      />

      {/* NEW: Fluoroquinolone Tendon Rupture Ad */}
      <Composition
        id="FluoroquinoloneAd"
        component={FluoroquinoloneAd}
        durationInFrames={1566}  // EXACT: Math.floor((78.341188 / 1.5) * 30) = 1566 frames
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioPath: staticFile('assets/audio/fluoroquinolone-narration.mp3'),
          questionData: {
            card_id: 1,
            vignette: "A 65-year-old man with a history of renal transplant is treated with ciprofloxacin for a UTI. On day 4 of therapy, he develops sudden sharp pain in his right ankle while walking. He reports a \"popping\" sensation and cannot plantarflex his foot.",
            lab_values: [
              {
                label: "WBC:",
                value: "7,800/μL",
                status: "normal",
                color: "#10b981",
                note: "(normal: 4,000-11,000)"
              },
              {
                label: "Creatinine:",
                value: "1.3 mg/dL",
                status: "normal",
                color: "#10b981",
                note: "(normal: 0.7-1.3)"
              },
              {
                label: "Thompson test:",
                value: "Positive",
                status: "critical",
                color: "#ef4444",
                note: "(abnormal)"
              },
              {
                label: "Current meds:",
                value: "Tacrolimus, ciprofloxacin, prednisone",
                status: "elevated",
                color: "#fbbf24",
                note: ""
              }
            ],
            question_text: "Which mechanism best explains this patient's injury?",
            options: [
              {
                letter: "A",
                text: "Fluoroquinolone-induced collagen degradation in tendon tissue",
                is_correct: true
              },
              {
                letter: "B",
                text: "Hyperuricemia causing gouty arthritis",
                is_correct: false
              },
              {
                letter: "C",
                text: "Hypocalcemia from renal insufficiency",
                is_correct: false
              },
              {
                letter: "D",
                text: "Septic joint from hematogenous spread",
                is_correct: false
              },
              {
                letter: "E",
                text: "Steroid-induced avascular necrosis",
                is_correct: false
              }
            ],
            correct_answer: "A"
          }
        }}
      />

      {/* NEW: Mucormycosis Ad */}
      <Composition
        id="MucormycosisAd"
        component={MucormycosisAd}
        durationInFrames={1707}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          audioPath: staticFile('assets/audio/mucormycosis-narration.mp3'),
          questionData: {
            card_id: 1,
            vignette: "A 42-year-old man with poorly controlled type 1 diabetes presents to the ED with facial pain and blurred vision. He admits he stopped taking insulin 5 days ago. Examination reveals conjunctival suffusion, facial swelling, and a black necrotic eschar on his right nasal bridge and cheek.",
            lab_values: [
              {
                label: "Glucose:",
                value: "480 mg/dL",
                status: "critical",
                color: "#ef4444",
                note: "(critical, normal: 70-100)"
              },
              {
                label: "Serum ketones:",
                value: "Positive",
                status: "critical",
                color: "#ef4444",
                note: "(abnormal)"
              },
              {
                label: "pH:",
                value: "7.12",
                status: "critical",
                color: "#ef4444",
                note: "(acidotic, normal: 7.35-7.45)"
              },
              {
                label: "Biopsy:",
                value: "Broad, non-septated hyphae with right-angle branching",
                status: "critical",
                color: "#ef4444",
                note: "(pathognomonic)"
              }
            ],
            question_text: "Which organism is most likely responsible for this patient's presentation?",
            options: [
              {
                letter: "A",
                text: "Candida albicans",
                is_correct: false
              },
              {
                letter: "B",
                text: "Cryptococcus neoformans",
                is_correct: false
              },
              {
                letter: "C",
                text: "Aspergillus fumigatus",
                is_correct: false
              },
              {
                letter: "D",
                text: "Mucor species (Mucormycosis)",
                is_correct: true
              },
              {
                letter: "E",
                text: "Pneumocystis jirovecii",
                is_correct: false
              }
            ],
            correct_answer: "D"
          }
        }}
      />

      {/* NEW: Desquamative Interstitial Pneumonia Ad - WITH MEMES! */}
      <Composition
        id="DesquamativeAd"
        component={DesquamativeAd}
        durationInFrames={1931}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Legionella Ad - WITH MEMES & SOUNDS! */}
      <Composition
        id="LegionellaAd"
        component={LegionellaAd}
        durationInFrames={1501}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Squamous Cell Lung Carcinoma Ad */}
      <Composition
        id="SquamousCellLungCarcinomaAd"
        component={SquamousCellLungCarcinomaAd}
        durationInFrames={1714}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Squamous Cell Lung Carcinoma Ad V2 - WITH HARD CUT MEMES! */}
      <Composition
        id="SquamousCellLungCarcinomaAdV2"
        component={SquamousCellLungCarcinomaAdV2}
        durationInFrames={1714}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Wernicke Encephalopathy Ad - WITH DRUNK MAN MEME! */}
      <Composition
        id="WernickeAd"
        component={WernickeAd}
        durationInFrames={1170}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Aspiration Pneumonia Ad - WITH DRUNK MAN MEME + STATIC OVERLAYS! */}
      <Composition
        id="AspirationPneumoniaAd"
        component={AspirationPneumoniaAd}
        durationInFrames={1893}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Pyrazinamide Hepatotoxicity Ad - WITH VIDEO MEME OVERLAY! */}
      <Composition
        id="PyrazinamideAd"
        component={PyrazinamideAd}
        durationInFrames={1776}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Squamous Cell Lung Cancer with Hypercalcemia Ad - PTHrP Production! */}
      <Composition
        id="SquamousCellLungHypercalcemiaAd"
        component={SquamousCellLungHypercalcemiaAd}
        durationInFrames={1850}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Nephrotic Syndrome - Minimal Change Disease! */}
      <Composition
        id="NephroticSyndromeMinimalChange"
        component={NephroticSyndromeMinimalChangeAd}
        durationInFrames={1566}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Pseudomonas Ecthyma Gangrenosum! */}
      <Composition
        id="PseudomonasEcthymaGangrenosum"
        component={PseudomonasEcthymaGangrenosumAd}
        durationInFrames={1651}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: BPH - 5-Alpha-Reductase Inhibitor! */}
      <Composition
        id="BphFiveAlphaReductase"
        component={BphFiveAlphaReductaseAd}
        durationInFrames={1621}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* NEW: Streptococcus Pneumoniae - Lobar Pneumonia! */}
      <Composition
        id="StreptococcusPneumoniaeLobarPneumonia"
        component={StreptococcusPneumoniaeLobarPneumoniaAd}
        durationInFrames={1821}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
