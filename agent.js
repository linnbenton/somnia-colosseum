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
    `\x1b[36m[Somnia L1]: Menarik data Gladiator #${fighter1Id} dan #${fighter2Id} dari Blockchain...\x1b[0m`,
  );

  let f1, f2;
  try {
    f1 = await colosseumContract.getGladiator(fighter1Id);
    f2 = await colosseumContract.getGladiator(fighter2Id);
  } catch (error) {
    console.log(
      `\x1b[33m[Notice]: Kontrak belum terbaca di address tersebut. Menjalankan mode simulasi gladiator...\x1b[0m`,
    );
    f1 = {
      id: 1,
      name: "NeonSamurai-X",
      strength: 6,
      agility: 7,
      intelligence: 2,
      strategyPrompt: "Gunakan kelincahan penuh untuk menusuk dari belakang!",
    };
    f2 = {
      id: 2,
      name: "ViperBot-09",
      strength: 4,
      agility: 4,
      intelligence: 7,
      strategyPrompt: "Analisis kelemahan lawan lalu tembak dari jarak jauh.",
    };
  }

  console.log(
    `\x1b[35m[AI Agent Engine]: Mengevaluasi Prompt Strategi Pertempuran...\x1b[0m`,
  );

  let battleLog = "";
  let winnerId;

  if (!hasApiKey) {
    console.log(
      `\x1b[33m[Local AI Simulator]: API Key kosong, menjalankan Local Deterministik Engine...\x1b[0m`,
    );

    const str1 = Number(f1.strength);
    const agi1 = Number(f1.agility);
    const int1 = Number(f1.intelligence);

    const str2 = Number(f2.strength);
    const agi2 = Number(f2.agility);
    const int2 = Number(f2.intelligence);

    let score1 = str1 * 1.5 + agi1 * 1.2 + int1 * 1.0;
    let score2 = str2 * 1.5 + agi2 * 1.2 + int2 * 1.0;

    if (f1.strategyPrompt.toLowerCase().includes("kelincahan") && agi1 > agi2)
      score1 += 2;
    if (f2.strategyPrompt.toLowerCase().includes("analisis") && int2 > int1)
      score2 += 2;

    winnerId = score1 >= score2 ? Number(f1.id) : Number(f2.id);
    const winnerName = score1 >= score2 ? f1.name : f2.name;
    const loserName = score1 >= score2 ? f2.name : f1.name;

    battleLog = `[Ronde 1]: ${f1.name} melancarkan strategi: "${f1.strategyPrompt}".\n[Ronde 2]: ${f2.name} mencoba membalas namun kalkulasi taktis memihak lawan.\n\nWINNER_ID: [${winnerId}] - ${winnerName} menang atas ${loserName} secara mutlak!`;
  } else {
    // Jika nanti lu udah dapet API Key, blok ini yang bakal jalan otomatis memanggil LLM Somnia asli
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
      console.log("Gagal memanggil API Somnia, beralih ke local fallback.");
      winnerId = Number(f1.id);
    }
  }

  console.log(
    `\x1b[32m--- HASIL PERTANDINGAN ---\n${battleLog}\n--------------------------\x1b[0m`,
  );

  // Kirim tx balik ke blockchain
  try {
    const battleId = Math.floor(Math.random() * 1000000);
    const loserId = winnerId === Number(f1.id) ? Number(f2.id) : Number(f1.id);

    console.log(
      `\x1b[33m[Consensus]: Mengunci skor pemenang ID #${winnerId} ke Somnia L1...\x1b[0m`,
    );
    const tx = await colosseumContract.recordBattleResult(
      battleId,
      winnerId,
      loserId,
      "LOG_HASH_DETERMINISTIC",
    );
    await tx.wait();
    console.log(
      `\x1b[32m[Sukses]: Transaksi On-Chain Berhasil! Hash: ${tx.hash}\x1b[0m`,
    );
  } catch (txError) {
    console.log(
      `\x1b[31m[Simulated Tx]: Log tercatat secara lokal (Kontrak belum di-deploy/bukan Owner).\x1b[0m`,
    );
  }
}

runAgentColosseum(0, 1);
