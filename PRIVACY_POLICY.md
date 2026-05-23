# PRIVACY POLICY
## MindCheck — Mental Wellness App

**Effective Date:** 10th April 2026  
**Last Updated:** 23rd May 2026

---

## 1. Introduction

MindCheck is a mental wellness self-reflection application developed by the Translational Neuroscience and Technology Lab (TRANSiT Lab), Department of Cognitive Science, IIT Kanpur, in association with the Center for Mental Health and Wellbeing (CMHW), IIT Kanpur.

This Privacy Policy explains how we collect, use, store, and protect your information when you use the MindCheck mobile application.

By using MindCheck, you agree to the terms outlined in this Privacy Policy. If you do not agree, please do not use the application.

---

## 2. Information We Collect

### 2.1 Data You Provide

When you use MindCheck, you may provide the following information:

- **Self-assessment responses:** Answers to validated mental health questionnaires (PHQ-9, GAD-7, PSS, RSES) for self-reflection purposes only.
- **Journal entries:** Personal reflections, text entries, emotions, hashtags, and optional photo attachments.
- **Day log entries:** Daily mood, energy, and stress self-reports through Ecological Momentary Assessment (EMA).
- **Cognitive game performance:** Scores, reaction times, and accuracy from in-app cognitive exercises (Go/No-Go, Attention, Memory, Counting).
- **Preferences:** App settings such as dark mode, check-in frequency, and notification preferences.

### 2.2 Data We Do NOT Collect

We do NOT collect any of the following:

- Your name, email address, phone number, or any personally identifiable information.
- Location data, contacts, or device identifiers.
- Data via analytics, tracking, or advertising SDKs.

By default, no data ever leaves your device. If you choose to enable Cloud Backup (see Section 2.3), anonymized data is synced to a secure cloud database strictly for mental health research purposes.

### 2.3 Optional Cloud Backup and Research Contribution

MindCheck offers an optional Cloud Backup feature. If you choose to enable it — either at first launch when prompted, or later via Profile → Data & Privacy → Cloud Backup — the following data is securely synced to our cloud database:

- Self-assessment responses (PHQ-9, GAD-7, PSS, RSES scores and individual question answers)
- Journal entries (text, emotions, hashtags; photo attachments are not synced to the cloud)
- Day log entries (EMA responses, including questions and answers)
- Cognitive game performance metrics (scores, accuracy, reaction times)
- In-app activity events (e.g., check-in started, tab visited, journal written)

**Anonymization:** All cloud data is linked only to a randomly generated Firebase Anonymous Authentication ID — a system-generated string with no connection to your name, email, device, or any other personal identifier. No personally identifiable information is ever stored in the cloud.

**Purpose:** Anonymized data is used by researchers at TRANSiT Lab and CMHW, IIT Kanpur to study mental wellness patterns and improve mental health support tools. Data may contribute to academic research using only aggregated or fully anonymized findings — no individual data is ever published.

**Your control:** You can enable or disable Cloud Backup at any time from Profile → Data & Privacy → Cloud Backup. Disabling backup stops all future syncing immediately. Your locally stored data is never affected by toggling this setting.

---

## 3. How Your Data Is Stored

### 3.1 Local Storage (All Users)

All health data (self-assessment responses, journal entries, day logs, and game performance) is stored in encrypted local storage on your device. Encryption is applied on-device, meaning your health data is not readable by other apps or websites. Your data remains on your device at all times unless you explicitly enable Cloud Backup.

- **No cloud backup by default:** If you do not enable Cloud Backup, your data never leaves your phone. If you uninstall the app or clear app data, your data will be permanently deleted.
- **User ID:** A randomly generated anonymous identifier is created on first use. This ID is stored locally and is not linked to your personal identity.

### 3.2 Cloud Storage (Opted-In Users Only)

If you enable Cloud Backup, your anonymized data is stored in Google Firebase Firestore, a secure cloud database operated by Google LLC. Data is organized under a randomly generated Firebase Anonymous Authentication ID and is not linked to any personal identifier.

- **Retention:** Cloud data is retained for the duration of the research study. You may request deletion of your cloud data at any time by contacting us at transitlabiitk18@gmail.com (see Section 5.2).
- **Access:** Only authorized researchers at TRANSiT Lab and CMHW, IIT Kanpur have access to anonymized research data. Google LLC has access as the infrastructure provider, subject to their own privacy and security policies.

---

## 4. How We Use Your Data

### 4.1 Local Use (All Users)

Your locally stored data is used solely within the app to:

- Display your self-assessment scores and trends over time.
- Show your journal entries and mood history.
- Track cognitive game performance and improvement.
- Provide personalised self-reflection insights based on your entries.

### 4.2 Research Use (Opted-In Users Only)

If you enable Cloud Backup, your anonymized data may additionally be used by researchers at TRANSiT Lab and CMHW, IIT Kanpur to:

- Understand patterns in mental wellness across users.
- Improve the design and effectiveness of mental health self-reflection tools.
- Contribute to academic research publications using only aggregated or fully anonymized findings — no individual data is ever published or identifiable.

We do not sell, share, rent, or transfer your data to any third party for commercial purposes.

---

## 5. Data Export, Deletion, and Your Control

### 5.1 Export Your Data

You can export all your data at any time from Profile → Export My Data. Supported formats include JSON (full data), CSV (spreadsheet), and plain text (readable summary). Exported files include your anonymous User ID for your reference.

### 5.2 Delete Your Data

You can delete your locally stored data at any time from Profile → Clear All Data. Two options are available:

- **Clear health data only:** Removes check-ins, journals, game scores, and day logs while keeping your preferences and account settings.
- **Full reset:** Deletes everything and restarts the app as if freshly installed.

You can also delete all local data by uninstalling the app from your device. Since no data is stored externally by default, we cannot recover any deleted local data.

**Cloud data deletion (opted-in users only):** If you have enabled Cloud Backup, contact us at transitlabiitk18@gmail.com to request deletion of your cloud data. Please include your anonymous User ID (visible in Profile → User ID) so we can locate and delete your records. We will process deletion requests within 30 days.

---

## 6. Data Security

### 6.1 Local Data

Your health data is encrypted at rest on your device, meaning it is not stored in a readable format by other apps or browser-based access. However, since locally stored data resides entirely on your device, its security depends primarily on your device's security. We recommend:

- Using a screen lock (PIN, pattern, fingerprint, or face unlock) on your device.
- Keeping your device's operating system updated.
- Not sharing your device with unauthorised individuals if your MindCheck data is sensitive to you.

### 6.2 Cloud Data (Opted-In Users Only)

Cloud data is protected by multiple layers of security:

- **Firebase Security Rules:** Server-side rules ensure each user's data is accessible only by that user's authenticated session. No other user or unauthenticated party can read or write your data.
- **Firebase Anonymous Authentication:** Data is linked only to a randomly generated UID, never to any personal identity.
- **Google Cloud infrastructure:** Firebase Firestore operates on Google's enterprise-grade infrastructure with encryption in transit (TLS) and encryption at rest.

While we take reasonable technical measures to protect your data, no system is entirely immune to security risks. We recommend disabling Cloud Backup if you prefer maximum data privacy.

---

## 7. Children's Privacy

MindCheck is intended for users aged 18 and above (or the age of majority in your jurisdiction). We do not knowingly collect data from children under 13. If you are under 18, please use this app only with parental or guardian guidance.

---

## 8. Medical Disclaimer and No Clinical Advice

MindCheck is NOT a diagnostic tool, medical device, or substitute for professional mental health care. The questionnaires used (PHQ-9, GAD-7, PSS, RSES) are validated self-report instruments intended for self-reflection only. Scores and results should not be interpreted as clinical diagnoses.

The app is intended for general wellness and informational purposes only. It is not a substitute for professional diagnosis, treatment, or therapy. Always seek advice from a qualified healthcare provider for any medical or mental health concerns.

If you are experiencing a mental health crisis, please contact a qualified mental health professional or use the crisis support resources provided within the app.

---

## 9. Mental Health Resources and Helplines

MindCheck provides users with access to mental health resources, including helpline numbers and support services, for informational and support purposes only.

- We do not operate, control, or endorse any specific helpline or service.
- We are not responsible for the availability, accuracy, or quality of these external services.
- External links (such as YourDOST, Treadwill, Tele MANAS, KIRAN, etc. helplines) are subject to those organisations' own privacy policies.

If you are experiencing a medical or mental health emergency, please contact your local emergency services immediately.

---

## 10. Third-Party Services

MindCheck does not integrate with any third-party analytics, advertising, or tracking services. The app does not contain advertisements.

**Firebase (Google LLC):** If you enable Cloud Backup, MindCheck uses Google Firebase Firestore and Firebase Anonymous Authentication to store and manage your anonymized data. Google LLC acts as a data processor on our behalf, providing secure cloud infrastructure. For users who do not enable Cloud Backup, no data is shared with Google or any other third party.

External links provided in the Support Resources section are for user convenience only and are subject to those organisations' own privacy policies.

---

## 11. Changes to This Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in the app or applicable law. Any changes will be reflected in the updated version of the app. We encourage you to review this policy periodically. The "Last Updated" date at the top of this document indicates when the latest changes were made.

---

## 12. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact us at:

- **Developer:** Dr. Pragathi Priyadarsini Balasubramani
- **Email:** pbalasub@iitk.ac.in / transitlabiitk18@gmail.com
- **Institution:** TRANSiT Lab, Department of Cognitive Science, IIT Kanpur; Center for Mental Health and Wellbeing (CMHW), IIT Kanpur
- **Address:** Rooms 524 and 527, Department of Cognitive Science, Engineering Science Building-2 (ESB-2), 4th Floor, Indian Institute of Technology Kanpur, Kanpur — 208016
- **Website:** https://sites.google.com/view/transit-lab
