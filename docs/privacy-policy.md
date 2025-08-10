---
title: Privacy Policy — Duroood Counter
description: Privacy Policy for the Durood Counter mobile application
---

# Privacy Policy

Last updated: 2025-08-10

This Privacy Policy explains how the Durood Counter app ("the App") processes information. We designed the App to function without collecting personally identifiable information (PII).

## Summary

- We do not require an account and do not collect names, email addresses, phone numbers, or precise location.
- Your personal counter and history are stored on your device.
- We store only aggregate, non-personal counters in Firebase Realtime Database.
- We do not sell data or use data for advertising.

## Data We Process

### On Your Device (local storage)

- Personal counter value (your total durood count)
- Local history entries (increments and bulk additions with timestamps)

Storage mechanism: React Native AsyncStorage. This data remains on your device and is not transmitted to our servers unless included in aggregate totals described below.

### In the Cloud (aggregate only)

- Global total count (sum of all users' contributions)
- Daily aggregate counts by date (e.g., 2025-08-10 → total for that day)

Backend: Google Firebase Realtime Database (region: asia-southeast1 per database URL). We do not store user identifiers. Contributions are added as aggregate totals without linking to a specific individual or device.

Network metadata such as IP addresses may be processed by Firebase and network providers for transport, security, and fraud prevention. We do not store this metadata in our application database.

## How We Use the Data

- Provide core functionality (maintain your local count and update aggregate counters)
- Display global and daily progress statistics
- Ensure reliability, integrity, and abuse prevention of the shared counter

We do not use the data for profiling or targeted advertising.

## Data Sharing

- We do not sell your data.
- We do not share data with third parties for marketing purposes.
- Service providers ("processors"): Google Firebase provides hosting and database infrastructure. Their processing is subject to Google’s terms and privacy policy.

## Data Retention

- Local data remains on your device until you delete it (via in‑app clear functions, app data reset, or uninstalling the app).
- Aggregate counters (global/daily totals) may be retained to preserve historical statistics. Because we do not store identifiers, we cannot isolate or remove a specific individual’s contribution from aggregate totals.

## Security

- Data in transit uses HTTPS/TLS.
- Firebase security rules and application controls help protect write operations. We intentionally avoid collecting PII.

## Children’s Privacy

The App is suitable for general audiences and does not target children specifically. We do not knowingly collect personal information from children.

## Your Choices

- Manage local data: You can clear your local history/counters via the app’s settings (if available) or by clearing the app’s storage/uninstalling the app.
- Opt-out of analytics/ads: The App does not include third‑party ads or analytics SDKs.

## International Data Transfers

Firebase may process data on servers located in various regions. The application database is configured for the asia-southeast1 region. Your use of the App implies consent to such processing, subject to Google’s terms.

## Contact

If you have questions, requests, or concerns about privacy:

Email: REPLACE_WITH_YOUR_SUPPORT_EMAIL

## Changes to This Policy

We may update this policy to reflect changes to the App or legal requirements. Material changes will be posted here with an updated “Last updated” date.

---

This page is provided for compliance with app store requirements, including Google Play’s Privacy Policy and Data Safety disclosures.
