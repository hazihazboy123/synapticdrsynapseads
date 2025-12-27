import React from 'react';
import { Composition } from 'remotion';
import { BetaBlockerOverdoseAd } from './components/BetaBlockerOverdoseAd';
import { PenicillinAnaphylaxisAd } from './components/PenicillinAnaphylaxisAd';
import { SickleCellAcuteChestAd } from './components/SickleCellAcuteChestAd';
import { DKAPotassiumAd } from './components/DKAPotassiumAd';

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

      {/* DKA Potassium Management - The Classic Gotcha
          - Students rush to slam insulin without checking K+
          - Serum K+ looks normal but total body is depleted
          - Insulin shoves K+ into cells → serum drops → cardiac arrest
          - Check first, replace if low, THEN insulin
      */}
      <Composition
        id="dka-potassium-management"
        component={DKAPotassiumAd}
        durationInFrames={1940}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
