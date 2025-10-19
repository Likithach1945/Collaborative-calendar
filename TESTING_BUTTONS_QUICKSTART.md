# Quick Start: Testing Sleek Invitation Buttons

## How to Test Locally

### 1. **Start the Development Server**
```bash
cd frontend
npm run dev
```

### 2. **Navigate to Invitations**
- Open your calendar app
- Click the bell icon/Invitations link in the header
- You should see invitation cards with the new button styling

### 3. **Test Each State**

#### A. Pending Invitation (Initial State)
```
✓ Primary Row (High Emphasis):
  - Accept button (green with icon)
  - Decline button (red with icon)

✓ Secondary Row (Low Emphasis):
  - Add Note button (gray border)
  - Propose New Time button (blue border & text)

✓ Interactions:
  - Hover each button → should float up (-2px) with enhanced shadow
  - Focus with Tab → should show 3px blue outline
  - Click Accept → should submit immediately
  - Click Decline → should open note input
  - Click Add Note → should expand note textarea
  - Click Propose New Time → should open time proposal form
```

#### B. Note Input Section
```
✓ Visual:
  - Slides down smoothly from Accept/Decline buttons
  - Gray gradient background
  - Textarea with blue focus ring
  - Character counter (e.g., "0/500 characters")

✓ Interactions:
  - Type in textarea → character count updates
  - Focus textarea → blue border + shadow
  - Submit button color matches action (green for accept, red for decline)
  - Cancel button clears the form and collapses
```

#### C. Accepted Invitation (Status Display)
```
✓ Visual:
  - Green background (#34a853 with 0.08 alpha)
  - Green border
  - Checkmark icon (green)
  - "You accepted this invitation" message

✓ Content:
  - Shows your response note (if provided)
  - Shows response timestamp
  - Smooth fade-in animation
```

#### D. Declined Invitation (Status Display)
```
✓ Visual:
  - Red background (#ea4335 with 0.08 alpha)
  - Red border
  - X icon (red)
  - "You declined this invitation" message

✓ Content:
  - Shows your response note (if provided)
  - Shows response timestamp
```

#### E. Proposed Time Invitation (Status Display)
```
✓ Visual:
  - Blue background (#1a73e8 with 0.08 alpha)
  - Blue border
  - Clock icon (blue)
  - "You proposed an alternative time" message

✓ Content:
  - Shows proposed start/end times
  - Shows your note (if provided)
  - Shows response timestamp
```

### 4. **Test Responsive Design**

#### Desktop (> 480px)
```bash
# DevTools: Disable device toolbar
# Buttons should display horizontally:
# [Accept] [Decline]
# [Add Note] [Propose New Time]
```

#### Mobile (< 480px)
```bash
# DevTools: Enable device toolbar → select mobile size
# Buttons should stack vertically:
# [Accept]
# [Decline]
# [Add Note]
# [Propose New Time]
```

### 5. **Test Accessibility**

#### Keyboard Navigation
```
1. Tab through all buttons
2. Verify blue focus outline appears on each
3. Press Enter/Space to activate
4. Focus should be visible at all times
```

#### Screen Reader
```
1. Enable screen reader (NVDA, JAWS, etc.)
2. Tab to each button
3. Verify aria-label is announced
4. Verify button purpose is clear
```

#### Color Contrast
```
1. Open DevTools → Accessibility
2. Check color contrast ratios
3. Should meet WCAG AA standard (≥4.5:1 for text)
```

### 6. **Test Edge Cases**

#### Loading State
```
- Click Accept/Decline → should show "Submitting..." text
- Button should be disabled while loading
- Cursor should change to "not-allowed"
```

#### Error State
```
1. Simulate API error (e.g., network offline)
2. Click Accept/Decline
3. Should display error message in red box
4. Error message should be dismissible or auto-hide after timeout
```

#### Multiple Notes
```
- Type a long note (near 500 character limit)
- Character counter should update in real-time
- Textarea should not allow > 500 characters
- Submit button should remain enabled
```

## Expected Behavior Checklist

### Button Styling
- [ ] Primary buttons (green/red) are larger with more prominence
- [ ] Secondary buttons (gray/blue) are smaller and subtly styled
- [ ] All buttons have rounded corners (not sharp edges)
- [ ] Buttons have subtle shadows for depth
- [ ] Buttons match Google Calendar color scheme

### Hover Effects
- [ ] All buttons respond to hover (float up, shadow changes)
- [ ] Color deepens slightly on hover (darker shade)
- [ ] Transition is smooth (0.2s duration)
- [ ] Desktop hover effect doesn't apply on mobile

### Animations
- [ ] Note input slides down smoothly (not jarring)
- [ ] Status display fades in gently
- [ ] Error message appears/disappears smoothly
- [ ] Respects reduced motion preference (if enabled)

### Responsive
- [ ] Desktop: horizontal button layout
- [ ] Mobile: vertical button stack
- [ ] All text remains readable on mobile
- [ ] Touch targets are at least 44x44px

### Accessibility
- [ ] Focus ring visible on all interactive elements
- [ ] Color not the only way to distinguish buttons (icons present)
- [ ] Proper ARIA labels on all buttons
- [ ] High contrast text on all buttons
- [ ] Keyboard navigation works smoothly

## Common Issues & Solutions

### Issue: Buttons look misaligned
**Solution**: Check that CSS file is properly imported. Verify import statement in JSX:
```jsx
import './InvitationResponseButtons.css';
```

### Issue: Hover effect not working
**Solution**: Verify browser supports CSS transforms. Check DevTools → Styles for applied rules.

### Issue: Mobile layout not stacking
**Solution**: Check media query is active. In DevTools:
1. Enable device toolbar
2. Set viewport to < 480px
3. Verify CSS media query triggers

### Issue: Color looks wrong
**Solution**: Verify CSS custom variables are defined in `index.css`:
```css
--google-blue: #1a73e8;
--google-green: #34a853;
--google-red: #ea4335;
```

### Issue: Animation not smooth
**Solution**: Check if browser has GPU acceleration. In DevTools:
1. Open Rendering tab
2. Enable "Paint flashing"
3. Click button to see if only transform/opacity change (good)
4. If entire box reflows, there's a layout thrashing issue

## Performance Testing

### Lighthouse
```bash
# Run Lighthouse audit on Invitations page
# Check for:
# - Performance score > 90
# - No layout shifts (CLS near 0)
# - No slow CSS animations
```

### DevTools Performance Profiler
```
1. Open DevTools → Performance tab
2. Click Record button
3. Click Accept/Decline/Add Note buttons
4. Stop recording
5. Verify:
   - Frame rate stays 60fps
   - No red marks (jank)
   - JavaScript execution < 50ms
```

## Browser Testing

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full Support |
| Firefox | 88+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 90+ | ✅ Full Support |

## Deployment Verification

After deploying to production:

1. **Smoke Test**
   - Open Invitations page
   - Verify buttons display correctly
   - Verify basic accept/decline flow works

2. **Analytics**
   - Monitor button click rates
   - Check for increased/decreased acceptance rates
   - Look for error reports in logs

3. **User Feedback**
   - Monitor support tickets for UI issues
   - Collect feedback on new design
   - Note any accessibility complaints

---

## Need Help?

### Check These Files
- Component: `frontend/src/components/InvitationResponseButtons.jsx`
- Styles: `frontend/src/components/InvitationResponseButtons.css`
- Global Theme: `frontend/src/index.css`
- Test Suite: `frontend/src/components/__tests__/InvitationResponseButtons.test.jsx`

### Review These Docs
- `INVITATION_RESPONSE_BUTTONS_REDESIGN.md` - Full design details
- `BEFORE_AFTER_BUTTONS_COMPARISON.md` - Visual comparison

---

**Status**: ✅ Ready for Testing  
**Last Updated**: 2025-10-16
