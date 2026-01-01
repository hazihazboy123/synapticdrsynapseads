import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { MockUploadScreen } from './MockUploadScreen';

/**
 * PDF Drag Preview Component
 * Animates the PDF drag progress over 30 frames (1 second)
 */
export const PDFDragPreview = ({
  showOnFrame = 0,
  selectedMode = 'anki',
  userName = 'Future Doctor',
}) => {
  const frame = useCurrentFrame();

  // PDF drag completes in 30 frames (1 second at 30fps)
  // After that, transition to file selected state
  const pdfDragProgress = interpolate(
    frame - showOnFrame,
    [0, 30],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // After drag completes, show file selected state
  const showFileSelected = frame - showOnFrame > 40;

  return (
    <MockUploadScreen
      showOnFrame={showOnFrame}
      selectedMode={selectedMode}
      showFileSelected={showFileSelected}
      showPDFDrag={!showFileSelected}
      pdfDragProgress={pdfDragProgress}
      fileName="Pathophysiology_Lecture_23.pdf"
      fileSize="4.2 MB"
      userName={userName}
      showModeCards={true}
      showUploadZone={true}
    />
  );
};

export default PDFDragPreview;
