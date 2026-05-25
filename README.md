# 🤖 On-Chain Agent Colosseum

An innovative, fully autonomous AI-driven idle strategy game built on **Somnia Agentic L1 Infrastructure** for the **Encode Club Somnia Agentathon**.

---

## 🏆 Somnia Agentathon Submission

This project is officially developed for the [Somnia Agentathon](https://www.encodeclub.com/programmes/agentathon) organized by **Encode Club**. _On-Chain Agent Colosseum_ pushes the boundaries of Web3 and AI integration by utilizing Somnia’s high-throughput L1 infrastructure to power autonomous, agent-first smart contracts that live, think, and fight entirely on-chain.

---

## 🚀 Overview

**On-Chain Agent Colosseum** leverages Somnia L1's blazing-fast TPS and internal AI execution primitives to create an automated gladiator arena.

1. **Minting:** Players mint unique Gladiator NFTs, customizing basic stats (`STRENGTH`, `AGI`, `INT`).
2. **Brain Upgrading:** Players program their fighter's behavior by writing a custom text-based **AI Strategy Prompt** (e.g., _"If HP < 40%, play defensively and trigger critical counter-attacks"_).
3. **Autonomous Execution:** The autonomous backend agent orchestrates and reads the blockchain state deterministically, executes the battle logic using Somnia's agentic consensus framework, and settles the match outcomes directly back on-chain.

---

## 📐 System Architecture & Tree Flow

Below is the execution flow showing how the Cyberpunk Frontend, Autonomous Node, and Somnia L1 Smart Contract interact seamlessly:

```text
📂 somnia-colosseum (Root)
├── 📄 index.html (Cyberpunk UI Dashboard via Tailwind CSS)
├── 📄 agent.js (Autonomous AI Agent Orchestrator & Execution Engine)
├── 📄 package.json (Project Dependencies)
└── 📄 README.md (Documentation)

Execution Flow:
───────────────────────────────────────────────────────────────────────────
[ Cyberpunk Web Frontend ]
       │
       ▼ (1) Mint NFT & Input AI Tactic Prompt
[ MetaMask Wallet ]
       │
       ▼ (2) Broadcast Transaction
[ Somnia L1 Testnet (Colosseum.sol) ] <───┐
       │                                  │
       │ (3) Emits New Match Event        │ (5) Submits Fight Result
       ▼                                  │     & Settles State On-Chain
[ Autonomous Agent Orchestrator ] ─────────┘
       │
       ▼ (4) Evaluates Battle Logic
 🧠 Local Deterministic LLM Engine (Fallback Mode)
───────────────────────────────────────────────────────────────────────────
```

---

## 🛠️ Tech Stack

- **Smart Contract:** Solidity deployed on Somnia Agentic L1 (Shannon Testnet).
- **Contract Address:** `0x17F24D3b8Bc1150553b54Da30B4d993AcB889212`
- **RPC Network URL:** `https://dream-rpc.somnia.network`
- **Block Explorer:** [Somnia Shannon Explorer](https://shannon-explorer.somnia.network/)
- **Agent Runtime:** Node.js, `ethers.js` for on-chain state synchronization.
- **Frontend Dashboard:** Cyberpunk & Sci-Fi neon pulsed UI built with HTML5, Tailwind CSS, and FontAwesome.

---

# 📦 Getting Started

```bash
git clone https://github.com/linnbenton/somnia-colosseum.git
cd somnia-colosseum
npm install
npm run dev
```

---

# 🔮 Future Roadmap

- Ranked battle arenas
- Evolutionary AI behaviors
- Tournament systems
- On-chain rewards
- Advanced LLM battle reasoning
- Persistent autonomous world simulation

---

# 📄 License

MIT License
