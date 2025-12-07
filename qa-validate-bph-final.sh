#!/bin/bash
COMPONENT="src/components/BphFiveAlphaReductaseAd.jsx"

echo "🔍 FINAL QA CHECK (Critical Items Only)"
echo "========================================"
echo ""

# Check 1: Timer starts at optionTimestamps.A
if grep -q "questionStartTimeRaw = optionTimestamps.A" "$COMPONENT"; then
  echo "✅ Timer starts at optionTimestamps.A"
else
  echo "❌ Timer doesn't use optionTimestamps.A"
  exit 1
fi

# Check 2: Timer duration calculated
if grep -q "timerDuration = answerRevealFrame - questionStartFrame" "$COMPONENT"; then
  echo "✅ Timer duration calculated"
else
  echo "❌ Timer duration missing"
  exit 1
fi

# Check 3: Button clicks (check for .map() pattern)
if grep -q "button-click.mp3" "$COMPONENT" && grep -q "Object.entries(optionTimestamps)" "$COMPONENT"; then
  echo "✅ Button-click sounds (via .map() loop)"
else
  echo "❌ Button-click sounds missing"
  exit 1
fi

# Check 4: Red vignette in final second
if grep -q "secondsRemaining === 1" "$COMPONENT" || grep -q "secondsRemaining <= 1" "$COMPONENT"; then
  echo "✅ Red vignette in final second"
else
  echo "❌ Red vignette missing"
  exit 1
fi

echo ""
echo "✅ ALL CRITICAL CHECKS PASSED!"
echo ""
