# 🔁 EigenLayer Restaking Info API

A backend service built with **Node.js** and optionally **Python**, exposing restaking data on the EigenLayer ecosystem, including restakers, validators, and reward insights. Built with clean modular structure, error handling, and support for log parsing via Python.

---

## 📌 Features

- List of restakers with amount restaked and validator info.
- Validator metadata: stake, status, slash history.
- Reward insights per wallet address.
- Log parsing via Python for incoming API calls.
- Uses **SQLite** as the database (lightweight and easy to manage).
- Modular, clean architecture with error handling.

---

## 📦 API Endpoints

### ✅ GET `/api/restakers`
Returns the list of all restakers.

**Response:**
```json
[
  {
    "userAddress": "0xAa1b...",
    "amountRestaked": 12.34,
    "validatorAddress": "0xBb2c...",
    "restakedAt": "2025-06-20T12:00:00Z",
    "validator": {
      "operatorId": "val1",
      "totalDelegatedStake": 100000,
      "status": "active"
    }
  }
]

✅ GET /api/validators
Returns the list of validators with their stats and slash history.

Response:

[
  {
    "operatorId": "val1",
    "operatorAddress": "0xBb2c...",
    "totalDelegatedStake": 100000,
    "status": "active",
    "slashEvents": [
      {
        "slashedAt": "2025-06-01T12:00:00Z",
        "amountSlashed": 20.5,
        "reason": "Downtime"
      }
    ]
  }
]

✅ GET /api/rewards/:address
Returns all reward data for a specific restaker address.

Response:

{
  "totalRewards": 2.0,
  "byValidator": {
    "val1": 1.25,
    "val2": 0.75
  },
  "rewards": [
    {
      "validatorAddress": "0xBb2c...",
      "amount": 1.25,
      "receivedAt": "2025-06-20T10:00:00Z"
    }
  ]
}

🧠 Log Parsing with Python
Every incoming API request is parsed using a Python script for log analysis (e.g., identifying lines with ERROR in the logs). This runs in the background and doesn't expose any additional API.

📄 Example parsed output on API call:

🔍 Python Parsed Logs:
- Found Errors: 0
  ✅ No errors found in log.
📁 Python file: scripts/parser.py
📄 Middleware: src/middleware/logParserMiddleware.js

🚀 Setup Instructions
1. Clone the Repo

git clone https://github.com/pujith20/zeru-assignment.git

2. Install Dependencies: npm install

3. Seed Initial Data
npm run seed

4. Start the Server

npm run dev
Server will be running at: http://localhost:3000

🗃️ Database
SQLite used for simplicity.

Tables:

restakers

validators

rewards

slash_events

Database auto-creates in ./data/eigenlayer.db

📡 Data Source Assumptions
Dummy data is used to simulate subgraph data.

fetchData.js mimics fetching from EigenLayer or similar sources.

Slash events and rewards are manually defined for demo purposes.

Can be extended to call real subgraphs or APIs (e.g., The Graph).

🧪 Python Usage
Python is used for log analysis only — not for API responses.
✅ Satisfies the requirement to "use Python if helpful for data processing".

⚠️ Assumptions
The validator/operator addresses are dummy values.

Slash events and reward timestamps are simulated.

No actual wallet connection/authentication — this is a public API.

Log parsing does not affect functionality — it's purely informative.

Deployed Link: https://zeru-assignment-jtl0.onrender.com

🧑‍💻 Author
Made by naga Pujith Kumar
For EigenLayer Restaking API Assignment
