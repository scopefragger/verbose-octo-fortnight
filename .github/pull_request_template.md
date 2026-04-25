## Summary

<!-- Describe what changed and why -->

## WDW Dining Data Checklist (if updating `data/wdw-dining.json`)

- [ ] Source URL verified and included in each new/updated entry (`"url"` field)
- [ ] `"last_verified"` date updated at the top of the file
- [ ] Dietary tags use only the approved enum values: `vegetarian`, `vegan`, `gluten_friendly`, `dairy_free`, `nut_free`, `allergy_friendly`
- [ ] Allergen disclaimer still present in `"_disclaimer"` field
- [ ] New entries include `id` (kebab-case slug), `park`, `type`, `price_tier`, `meals_served`, `reservation_required`
- [ ] Removed/closed restaurants deleted from the file
- [ ] Tested locally: server starts without JSON parse errors (`node index.js`)

## Other Changes

<!-- Describe any code changes outside the data file -->
