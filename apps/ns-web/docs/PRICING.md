# Pricing architecture — Morocco (MAD / DH)

Positioning: **premium-accessible**. Above generic gym merch, clearly below luxury. Some tees are
sourced from NEW YORKER and then printed or customised, so tees are not priced as luxury garments.

No cost data (garment, print, sewing, packaging, logistics, payment fees) exists in the project. These
are **positioning prices, not margin-validated prices.** Validate each line with the landed-cost
worksheet below before launch.

## One ladder

| Tier | Price | Products |
| --- | --- | --- |
| Accessory | 79 DH | Crew Socks |
| Accessory | 199 DH | Signature Cap |
| Entry / Essentials | 249 DH | Performance Tank · Essential Tee · Essential Shorts · Crossbody Bag |
| Performance | 299 DH | Performance Tee · Training Shorts |
| Statement | 329 DH | Graphic Tee (oversized) |
| Performance+ | 349 DH | Compression Long Sleeve |
| Carry | 399 DH | Gym Bag |
| Layers | 449 DH | Jogger |
| Layers | 549 DH | Premium Hoodie |

Rules:
- Every price ends in 9 and sits on the ladder. A new product joins an existing step; it doesn't
  create a new one.
- Printed or customised sourced tees stay at 249–329 DH.
- "Oversized Tee" is currently the Graphic Tee (the only oversized tee with imagery). A plain
  oversized tee would sit at 299 DH.

## Sets (permanent, not promotions)

| Set | Contents | Separately | Set price | Saving |
| --- | --- | --- | --- | --- |
| Training Set | Tank + Training Shorts | 548 | **499 DH** | 8.9 % |
| Gym-to-Street | Essential Tee + Essential Shorts + Crossbody + Socks | 826 | **749 DH** | 9.3 % |
| Gym Starter | Performance Tee + Training Shorts + Socks | 677 | **619 DH** | 8.6 % |
| Full Look | Premium Hoodie + Jogger | 998 | **899 DH** | 9.9 % |

The saving is capped at 12 % (enforced by `test/commerce.test.ts`). No countdowns, no "% OFF"
badges, no sitewide sales. Customers are not trained to wait.

## Landed-cost worksheet (fill per product before launch)

```
garment cost + print/embroidery + sewing/customisation + label/packaging
+ inbound shipping/customs share + outbound delivery subsidy
+ payment/COD fee (% of price) + returns & defects allowance (% of price)
+ marketing & creator allowance (% of price)
= fully loaded unit cost  →  target: price ≥ 2.5 × fully loaded unit cost
```

If a product misses that target, move it up one step on the ladder, or change the sourcing. Don't
create an off-ladder price.

## Europe

EUR prices for Germany/EU are not set yet. Recommendation: set them per product rather than
converting (e.g. the 249 DH tier ≈ €29–35). Add a second currency to `Money` when the EU store is
enabled.
