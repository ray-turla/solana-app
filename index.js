// Import Solana web3 functinalities
const {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");

// SET CALCULATIONS
const sol = (lamport) => parseInt(lamport) / LAMPORTS_PER_SOL; // READ SOL
const lamport = (amount) => amount * LAMPORTS_PER_SOL; // SEND SOL
// Connect to devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Create a new keypair
const newPair = Keypair.generate();
// Extract the public and private key from the keypair
const publicKey = new PublicKey(newPair.publicKey).toString();
const privateKey = newPair.secretKey;

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

// const DEMO_FROM_SECRET_KEY = new Uint8Array([
//   160, 20, 189, 212, 129, 188, 171, 124, 20, 179, 80, 27, 166, 17, 179, 198,
//   234, 36, 113, 87, 0, 46, 186, 250, 152, 137, 244, 15, 86, 127, 77, 97, 170,
//   44, 57, 126, 115, 253, 11, 60, 90, 36, 135, 177, 185, 231, 46, 155, 62, 164,
//   128, 225, 101, 79, 69, 101, 154, 24, 58, 214, 219, 238, 149, 86,
// ]);

const transferSol = async () => {
  console.log("START Transaction");

  // Get Keypair from Secret Key

  const from = Keypair.fromSecretKey(privateKey);

  // Other things to try:
  // 1) Form array from userSecretKey
  // const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
  // 2) Make a new Keypair (starts with 0 SOL)
  // const from = Keypair.generate();

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();
  await logFromToBalance(from, to);
  // Aidrop SOL to Sender wallet
  const fromAirDropSignature = await airDropSol(from, 1);
  // const fromAirDropSignature = await connection.requestAirdrop(
  //   new PublicKey(from.publicKey),
  //   2 * LAMPORTS_PER_SOL
  // );
  await logFromToBalance(from, to);

  // Latest blockhash (unique identifer of the block) of the cluster
  let latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refers to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: fromAirDropSignature,
  });

  console.log("Airdrop completed for the Sender account");
  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      // transfers half from wallet balance
      lamports: lamport((await getWalletBalance(from)) * 0.5),
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);
  console.log("Signature is ", signature);
  await logFromToBalance(from, to);
  console.log("END Transaction");
};

// Get the wallet balance from a given private key
const getWalletBalance = async (wallet) => {
  try {
    // Make a wallet (keypair) from privateKey and get its balance in lamports
    const walletBalance = await connection.getBalance(
      new PublicKey(wallet.publicKey)
    );
    // console.log(
    //   `Wallet balance: ${} SOL`
    // );
    return sol(walletBalance);
  } catch (err) {
    console.log(err);
  }
};

const airDropSol = async (wallet, amount) => {
  try {
    console.log("START Airdrop");
    // Connect to the Devnet and make a wallet from privateKey
    // const myWallet = await Keypair.fromSecretKey(privateKey);

    // Request airdrop of 2 SOL to the wallet
    const fromAirDropSignature = await connection.requestAirdrop(
      // Airdrop to self
      new PublicKey(wallet.publicKey),

      // Airdrop to selected user
      // new PublicKey(processUserInput()),
      lamport(amount)
    );
    console.log(`Airdropped ${sol(lamport(amount))} SOL to Wallet`);
    await connection.confirmTransaction(fromAirDropSignature);
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
  // await airDropSol();
  await transferSol();
};
mainFunction();
