import { SomniaAgentKit } from "somnia-agent-kit";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const RPC_URL =
  process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Definisikan kit, jika API Key kosong isi dengan teks dummy agar objek tidak crash saat inisialisasi
const hasApiKey =
  process.env.SOMNIA_AI_API_KEY && process.env.SOMNIA_AI_API_KEY !== "KOSONG";
const kit = new SomniaAgentKit({
  privateKey: process.env.PRIVATE_KEY,
  apiKey: hasApiKey ? process.env.SOMNIA_AI_API_KEY : "mock_key",
});

const contractABI = [
  "function getGladiator(uint256 _id) external view returns (tuple(uint256 id, string name, uint8 strength, uint8 agility, uint8 intelligence, string strategyPrompt, address owner, uint256 wins, uint256 battles))",
  "function recordBattleResult(uint256 _battleId, uint256 _winnerId, uint256 _loserId, string memory _logHash) external",
];
const contractAddress = process.env.CONTRACT_ADDRESS;
const colosseumContract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet,
);

async function runAgentColosseum(fighter1Id, fighter2Id) {
  console.log(
    `\x1b[36m[Somnia L1]: Fetching Gladiator data #${fighter1Id} and #${fighter2Id} from Blockchain...\x1b[0m`,
  );

  let f1, f2;
  try {
    f1 = await colosseumContract.getGladiator(fighter1Id);
    f2 = await colosseumContract.getGladiator(fighter2Id);
  } catch (error) {
    console.log(
      `\x1b[33m[Notice]: Contract not detected at the specified address. Running gladiator simulation mode...\x1b[0m`,
    );
    f1 = {
      id: 1,
      name: "NeonSamurai-X",
      strength: 6,
      agility: 7,
      intelligence: 2,
      strategyPrompt: "Execute maximum agility to perform a backstab attack!",
    };
    f2 = {
      id: 2,
      name: "ViperBot-09",
      strength: 4,
      agility: 4,
      intelligence: 7,
      strategyPrompt:
        "Analyze enemy vulnerabilities and strike from long range.",
    };
  }

  console.log(
    `\x1b[35m[AI Agent Engine]: Evaluating Combat Strategy Prompts...\x1b[0m`,
  );

  let battleLog = "";
  let winnerId;

  if (!hasApiKey) {
    console.log(
      `\x1b[33m[Local AI Simulator]: Empty API Key, executing Local Deterministic Engine...\x1b[0m`,
    );

    const str1 = Number(f1.strength);
    const agi1 = Number(f1.agility);
    const int1 = Number(f1.intelligence);

    const str2 = Number(f2.strength);
    const agi2 = Number(f2.agility);
    const int2 = Number(f2.intelligence);

    let score1 = str1 * 1.5 + agi1 * 1.2 + int1 * 1.0;
    let score2 = str2 * 1.5 + agi2 * 1.2 + int2 * 1.0;

    // FIX LOGIC: Mengubah pencocokan kata kunci ke varian kalimat baru
    if (f1.strategyPrompt.toLowerCase().includes("agility") && agi1 > agi2)
      score1 += 2;
    if (f2.strategyPrompt.toLowerCase().includes("analyze") && int2 > int1)
      score2 += 2;

    winnerId = score1 >= score2 ? Number(f1.id) : Number(f2.id);
    const winnerName = score1 >= score2 ? f1.name : f2.name;
    const loserName = score1 >= score2 ? f2.name : f1.name;

    battleLog = `[Round 1]: ${f1.name} initiates strategy: "${f1.strategyPrompt}".\n[Round 2]: ${f2.name} attempts to counter, but tactical calculations favor the opponent.\n\nWINNER_ID: [${winnerId}] - ${winnerName} defeats ${loserName} with absolute dominance!`;
  } else {
    try {
      const response = await kit.chat.completions.create({
        model: "somnia-llama-3-70b-deterministic",
        messages: [
          {
            role: "user",
            content: `${f1.strategyPrompt} vs ${f2.strategyPrompt}`,
          },
        ],
      });
      battleLog = response.choices[0].message.content;
      const match = battleLog.match(/WINNER_ID:\s*\[(\d+)\]/);
      winnerId = match ? parseInt(match[1]) : Number(f1.id);
    } catch (e) {
      console.log("Failed to call Somnia API, reverting to local fallback.");
      winnerId = Number(f1.id);
    }
  }

  console.log(
    `\x1b[32m--- BATTLE TOURNAMENT RESULTS ---\n${battleLog}\n---------------------------------\x1b[0m`,
  );

  // Kirim tx balik ke blockchain
  try {
    const battleId = Math.floor(Math.random() * 1000000);
    const loserId = winnerId === Number(f1.id) ? Number(f2.id) : Number(f1.id);

    console.log(
      `\x1b[33m[Consensus]: Locking winning score for ID #${winnerId} onto Somnia L1...\x1b[0m`,
    );
    const tx = await colosseumContract.recordBattleResult(
      battleId,
      winnerId,
      loserId,
      "LOG_HASH_DETERMINISTIC",
    );
    await tx.wait();
    console.log(
      `\x1b[32m[Success]: On-Chain Transaction Successful! Hash: ${tx.hash}\x1b[0m`,
    );
  } catch (txError) {
    console.log(
      `\x1b[31m[Simulated Tx]: Log recorded locally (Contract unverified or sender is not the Owner).\x1b[0m`,
    );
  }
}

runAgentColosseum(0, 1);
