# 🕵️ Human Detector (Boss Detector)

> Catch anyone trying to sneak in — live human detection on a Raspberry Pi 5 with a real-time dashboard.

---

## 🧠 About This Project

**Human Detector** is an edge AI security camera project that detects when a person enters the frame and logs the intrusion with a timestamp. Built on a Raspberry Pi 5 with a live camera feed, it uses AI to spot humans in real time and reports detections to a dashboard built on Replit.

Field tested and verified: it caught **Laksh** trying to sneak in at **3:42 PM**. The dashboard didn't miss a thing.

---

## 🛠️ Tech Stack

| Layer | Tool |
|---|---|
| **Hardware** | Raspberry Pi 5 + Camera Module |
| **AI / Detection** | Claude (Anthropic API), Gemini (Google) |
| **Dashboard & Backend** | Replit |
| **Language** | Python |

---

## ⚙️ How It Works

1. **Watch** — The Pi camera streams a live feed, monitoring the room continuously
2. **Detect** — Claude analyzes frames and identifies when a human is present
3. **Log** — The detection is timestamped and sent to the Replit dashboard
4. **Alert** — The dashboard displays the intrusion log so you always know who came in and when

---

## 📊 The Dashboard

The Replit-hosted dashboard shows:

- ✅ Live detection status (Human detected / All clear)
- 🕐 Timestamp of each detection event
- 📋 Full intrusion log with history

---

## 🧪 Real-World Test

| Who | Time | Result |
|---|---|---|
| Laksh | 3:42 PM | 🚨 Caught |

The Boss Detector works. Don't test it.

---

## 💡 Key Learnings

- Using Claude for real-time image analysis instead of a traditional CV model
- Connecting Raspberry Pi hardware to a cloud-hosted dashboard via API
- Building a simple but functional security logging system
- Combining edge hardware with web-based monitoring

---

## 🚀 Part of the AI Bootcamp

This project was built during the **Week 2 Physical AI** phase of a 15-day AI Developer Bootcamp.  
See the full bootcamp repo → [The AI Bootcamp](../README.md)

---

*No sneaking allowed.* 🚫👀
