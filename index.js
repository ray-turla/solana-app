// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");

// Create a new keypair
const newPair = new Keypair();

// Exact the public and private key from the keypair
const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const privateKey = newPair._keypair.secretKey;

// Connect to the Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

console.log("Public Key of the generated keypair", publicKey);

const processUserInput = () => {
  console.log("Processing user input");
  const args = process.argv;
  if (!(args.length >= 1 && args.length <= 3)) {
    throw new Error("Can only can only accept 1 value");
  }
  const input = args[2];
  console.log("User input:", input);
  return input;
};

// Get the wallet balance from a given private key
const getWalletBalance = async () => {
  try {
    // Connect to the Devnet
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // console.log("Connection object is:", connection);

    // Make a wallet (keypair) from privateKey and get its balance
    const myWallet = await Keypair.fromSecretKey(privateKey);
    const walletBalance = await connection.getBalance(
      new PublicKey(myWallet.publicKey)
    );
    console.log(
      `Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`
    );
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async () => {
  try {
    // Connect to the Devnet and make a wallet from privateKey
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const myWallet = await Keypair.fromSecretKey(privateKey);
    const args = process.argv;
    console.log(args[2]);

    // Request airdrop of 2 SOL to the wallet
    console.log("Airdropping some SOL to selected user wallet!");
    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(processUserInput()),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
  } catch (err) {
    console.log(err);
  }
};

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
};
mainFunction();
