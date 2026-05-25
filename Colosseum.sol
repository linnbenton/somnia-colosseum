// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title On-Chain Agent Colosseum
 * @dev Kontrak untuk mencetak Gladiator NFT dan mengelola data Agen AI di Somnia L1.
 * Menggunakan prinsip deterministik di mana state gladiator dan instruksi prompt tersimpan on-chain.
 */
contract Colosseum {

    struct Gladiator {
        uint256 id;
        string name;
        uint8 strength;
        uint8 agility;
        uint8 intelligence;
        string strategyPrompt;
        address owner;
        uint256 wins;
        uint256 battles;
    }

    uint256 private _nextTokenId;
    address public contractOwner;

    mapping(uint256 => Gladiator) public gladiators;
    mapping(address => uint256[]) public ownerToGladiators;

    event GladiatorMinted(uint256 indexed id, string name, address indexed owner);
    event BattleResolved(uint256 indexed battleId, uint256 winnerId, uint256 loserId, string logHash);

    // Membatasi alokasi poin stats maksimal saat minting (e.g., 15 poin)
    uint8 public constant MAX_STAT_POINTS = 15;

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Bukan owner kontrak atau Agent Executor!");
        _;
    }

    constructor() {
        contractOwner = msg.sender;
    }

    /**
     * @notice Minting Gladiator baru dengan stats kustom dan Prompt Strategi AI.
     */
    function mintGladiator(
        string memory _name,
        uint8 _strength,
        uint8 _agility,
        uint8 _intelligence,
        string memory _strategyPrompt
    ) external returns (uint256) {
        require(_strength + _agility + _intelligence <= MAX_STAT_POINTS, "Stats melebihi batas maksimal!");
        require(_strength >= 1 && _agility >= 1 && _intelligence >= 1, "Setiap stat minimal harus bernilai 1");
        require(bytes(_name).length > 0, "Nama tidak boleh kosong");

        uint256 tokenId = _nextTokenId++;

        gladiators[tokenId] = Gladiator({
            id: tokenId,
            name: _name,
            strength: _strength,
            agility: _agility,
            intelligence: _intelligence,
            strategyPrompt: _strategyPrompt,
            owner: msg.sender,
            wins: 0,
            battles: 0
        });

        ownerToGladiators[msg.sender].push(tokenId);

        emit GladiatorMinted(tokenId, _name, msg.sender);
        return tokenId;
    }

    /**
     * @notice Mengambil data lengkap Gladiator berdasarkan ID.
     */
    function getGladiator(uint256 _id) external view returns (Gladiator memory) {
        return gladiators[_id];
    }

    /**
     * @notice Simulasi eksekusi deterministik untuk update riwayat pertarungan.
     * Pada Somnia, fungsi ini dipanggil oleh Validator Node setelah memproses deterministik LLM Inference.
     */
    function recordBattleResult(
        uint256 _battleId,
        uint256 _winnerId,
        uint256 _loserId,
        string memory _logHash
    ) external onlyOwner {
        // Hanya owner (atau akun backend agent.js lu) yang bisa submit hasil pertandingan ke blockchain
        gladiators[_winnerId].wins += 1;
        gladiators[_winnerId].battles += 1;
        gladiators[_loserId].battles += 1;

        emit BattleResolved(_battleId, _winnerId, _loserId, _logHash);
    }

    /**
     * @notice Mendapatkan daftar Gladiator milik address tertentu.
     */
    function getGladiatorsByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerToGladiators[_owner];
    }
}