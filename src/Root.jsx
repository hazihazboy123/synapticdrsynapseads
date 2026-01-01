import React from 'react';
import { Composition } from 'remotion';
import { BetaBlockerOverdoseAd } from './components/BetaBlockerOverdoseAd';
import { PenicillinAnaphylaxisAd } from './components/PenicillinAnaphylaxisAd';
import { SickleCellAcuteChestAd } from './components/SickleCellAcuteChestAd';
import { OpioidOverdoseAd } from './components/OpioidOverdoseAd';
import { HyperkalemiaAd } from './components/HyperkalemiaAd';
import { DigoxinToxicityAd } from './components/DigoxinToxicityAd';
import { MalignantHyperthermiaAd } from './components/MalignantHyperthermiaAd';
import { HeartAttackCinematic } from './components/HeartAttackCinematic';
import { OrganophosphatePoisoningAd } from './components/OrganophosphatePoisoningAd';
import { AcetaminophenOverdoseAd } from './components/AcetaminophenOverdoseAd';
import { TensionPneumothoraxAd } from './components/TensionPneumothoraxAd';
import { SynapticRecallUGC, MockUploadScreen, MockProcessingScreen, MockDownloadScreen, ThomasUGC, UGCCaptions, PDFDragPreview } from './components/UGC';

export const RemotionRoot = () => {
  return (
    <>
      {/* GOLD STANDARD: Beta-Blocker Overdose (1000 views, multiple likes)
          - Full screen zoom + typewriter effect
          - Punchy, engaging script
          - Strong visual hierarchy
          - Clear teaching moments
          - Reference this as the template for future ads
      */}
      <Composition
        id="beta-blocker-overdose"
        component={BetaBlockerOverdoseAd}
        durationInFrames={2159}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* REFERENCE: Penicillin Anaphylaxis - First-Line Epinephrine
          - Good example of mechanism explanation
          - Clean visual flow
          - Use for pattern reference
      */}
      <Composition
        id="penicillin-anaphylaxis"
        component={PenicillinAnaphylaxisAd}
        durationInFrames={1722}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Sickle Cell Acute Chest Syndrome - Exchange Transfusion
          - Demonstrates sickling mechanism and logjam
          - Exchange transfusion vs simple transfusion teaching
          - Death spiral concept visualization
      */}
      <Composition
        id="sickle-cell-acute-chest"
        component={SickleCellAcuteChestAd}
        durationInFrames={2210}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Opioid Overdose - Naloxone Reversal (BRAIN ROT SHORT VERSION)
          - Cuts after "GABA receptors!" - no mechanism explanation
          - Question + answer reveal only
          - MEME-HEAVY: 7 memes total
          - ~35s at 2x playback (69s raw audio)
      */}
      <Composition
        id="opioid-overdose"
        component={OpioidOverdoseAd}
        durationInFrames={1033}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Hyperkalemia - Calcium Gluconate (BRAIN ROT MEME EDITION)
          - Patient skipped dialysis for Bahamas cruise, K+ 7.8
          - Correct: B) Calcium gluconate (stabilizes heart)
          - Common wrong: A) Insulin (fixes number not heart)
          - Teaching: Calcium is a BOUNCER - protects heart while you fix K+
          - MEME-HEAVY: 17 memes total
          - ~40s at 2x playback (81s raw audio)
      */}
      <Composition
        id="hyperkalemia"
        component={HyperkalemiaAd}
        durationInFrames={1219}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Digoxin Toxicity - DigiFab (BRAIN ROT MEME EDITION)
          - Grandma doubled her heart pills, seeing yellow halos
          - Correct: C) Digoxin immune Fab (DigiFab)
          - Common wrong: A) Calcium gluconate (makes dig tox WORSE!)
          - Teaching: DigiFab binds digoxin, YANKS it out
          - MEME-HEAVY: 8 memes total
          - ~30s at 2x playback (59s raw audio)
      */}
      <Composition
        id="digoxin-toxicity"
        component={DigoxinToxicityAd}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Malignant Hyperthermia - Dantrolene (BRAIN ROT MEME MASTERPIECE)
          - Routine hernia repair → temp 107°F, muscles RIGID
          - Correct: C) Dantrolene
          - Common wrong: B) Cooling blankets ("SQUIRT GUN to a HOUSE FIRE")
          - Teaching: Dantrolene blocks calcium channels, muscles RELAX
          - MEME-HEAVY: 14 memes (4 INTERRUPT)
          - ~38s at 2x playback (75s raw audio)
      */}
      <Composition
        id="malignant-hyperthermia"
        component={MalignantHyperthermiaAd}
        durationInFrames={1126}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Organophosphate Poisoning - Atropine + Pralidoxime
          - Farmer drenched in pesticide, SLUDGE syndrome
          - Correct: B) Atropine (blocks muscarinic receptors)
          - Common wrong: E) Physostigmine (ACCELERATES death!)
          - Teaching: Atropine for symptoms, Pralidoxime for the CURE
          - ~83s at 2x playback (166s raw audio)
      */}
      <Composition
        id="organophosphate-poisoning"
        component={OrganophosphatePoisoningAd}
        durationInFrames={2490}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Acetaminophen Overdose - N-Acetylcysteine (NAC)
          - Girl took whole bottle of Tylenol, feels FINE but dying
          - Correct: C) N-Acetylcysteine (replenishes glutathione)
          - Common wrong: A) Activated charcoal (too late at 8 hours!)
          - Teaching: NAPQI toxicity, glutathione depletion, Rumack-Matthew nomogram
          - MEME-HEAVY: 9 memes (pill, this-is-fine, blinking-guy, etc.)
          - ~128s at 2x playback (256s raw audio)
      */}
      <Composition
        id="acetaminophen-overdose"
        component={AcetaminophenOverdoseAd}
        durationInFrames={4528}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Tension Pneumothorax - Needle Decompression
          - 22yo motorcycle accident, intubated, suddenly crashing
          - Correct: B) Needle decompression
          - Common wrong: A) Chest X-ray (wastes time - clinical diagnosis!)
          - Teaching: One-way valve, tension physiology, mediastinal shift
          - Clinical Pearl: Tension Triad - tracheal deviation, JVD, absent breath sounds
          - ~96s at 1.9x playback (183s raw audio)
      */}
      <Composition
        id="tension-pneumothorax"
        component={TensionPneumothoraxAd}
        durationInFrames={2892}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* ============================================
          CINEMATIC MEDICAL VIDEOS (Kling 2.6)
          Inside-the-body educational content
          ============================================ */}

      {/* Heart Attack: The Blocked Highway
          - 7 cinematic clips showing MI progression
          - POV journey through coronary artery
          - Plaque rupture → Clot → Occlusion → Cell death
          - Dr. Synapse narration overlay
          - 35 seconds at 30fps = 1050 frames
      */}
      <Composition
        id="heart-attack-cinematic"
        component={HeartAttackCinematic}
        durationInFrames={1050}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showBrain: true,
          showAudio: true,
        }}
      />

      {/* ============================================
          UGC B-ROLL COMPOSITIONS
          For Synaptic Recall product demos
          ============================================ */}

      {/* MAIN UGC AD - Full 30-second B-roll video
          - Hook → Pain Point → Product Reveal → Demo → CTA
          - Synced to voiceover timestamps
          - Recreates the Synaptic Recall UI programmatically
      */}
      <Composition
        id="synaptic-ugc-ad"
        component={SynapticRecallUGC}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* PREVIEW: Upload Screen Only
          - For testing/previewing the upload UI mockup
      */}
      <Composition
        id="ugc-upload-preview"
        component={MockUploadScreen}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showOnFrame: 0,
          selectedMode: 'anki',
          showFileSelected: true,
          fileName: 'Cardiology_Lecture_15.pdf',
          fileSize: '8.2 MB',
          userName: 'Future Doctor',
        }}
      />

      {/* PREVIEW: Processing Screen Only
          - For testing/previewing the flashcard generation UI
      */}
      <Composition
        id="ugc-processing-preview"
        component={MockProcessingScreen}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showOnFrame: 0,
          fileName: 'Cardiology_Lecture_15.pdf',
          cardCount: 6,
          totalCards: 25,
        }}
      />

      {/* PREVIEW: Download Screen Only
          - For testing/previewing the completion/download UI
      */}
      <Composition
        id="ugc-download-preview"
        component={MockDownloadScreen}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showOnFrame: 0,
          cardCount: 25,
          showConfetti: true,
        }}
      />

      {/* ============================================
          THOMAS UGC AD - With B-Roll and Captions
          Synced to Thomas's voiceover
          ============================================ */}
      <Composition
        id="thomas-ugc-ad"
        component={ThomasUGC}
        durationInFrames={1920} // ~64 seconds
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: 'thomas-voiceover.mp4',
          showCaptions: true,
          playbackRate: 1,
          showVideo: false, // Set to true when video file exists
        }}
      />

      {/* PREVIEW: PDF Drag Animation
          - Tests the fast 1-second PDF drag animation
          - Shows upload screen → PDF drag → file selected state
      */}
      <Composition
        id="ugc-pdf-drag-preview"
        component={PDFDragPreview}
        durationInFrames={150} // 5 seconds to see full sequence
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          showOnFrame: 0,
          selectedMode: 'anki',
          userName: 'Future Doctor',
        }}
      />
    </>
  );
};
