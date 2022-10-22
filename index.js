// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
} = require("@solana/web3.js");

// Connect to devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Create a new keypair
const newPair = new Keypair();

// Extract the public and private key from the keypair
const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const privateKey = newPair._keypair.secretKey;

// Connect to the Devnet

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
const getWalletBalance = async (wallet) => {
  try {
    // Make a wallet (keypair) from privateKey and get its balance
    const walletBalance = await connection.getBalance(
      new PublicKey(wallet.publicKey)
    );
    const solBalance = parseInt(walletBalance) / LAMPORTS_PER_SOL;
    // console.log(
    //   `Wallet balance: ${} SOL`
    // );
    return solBalance;
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async (wallet) => {
  try {
    console.log("START Airdrop");
    await getWalletBalance(wallet.secretKey);
    // Connect to the Devnet and make a wallet from privateKey
    // const myWallet = await Keypair.fromSecretKey(privateKey);

    // Request airdrop of 2 SOL to the wallet
    const fromAirDropSignature = await connection.requestAirdrop(
      // Airdrop to self
      new PublicKey(wallet.publicKey),

      // Airdrop to selected user
      // new PublicKey(processUserInput()),
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(fromAirDropSignature);
    await getWalletBalance(privateKey);
    console.log("END Airdrop");
    return fromAirDropSignature;
  } catch (err) {
    console.log(err);
  }
};

async function logFromToBalance(fromWallet, toWallet) {
  console.log("From WALLET Balance:", await getWalletBalance(fromWallet));
  console.log("To WALLET Balance:", await getWalletBalance(toWallet));
}

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
  await getWalletBalance();
  await airDropSol();
  await getWalletBalance();
};
mainFunction();
