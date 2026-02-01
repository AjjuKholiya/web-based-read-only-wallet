"use client"; // REQUIRED: This tells Next.js to run this in the browser

import { useState } from "react";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

export default function Home() {
  // STATE: This is where we store data in memory
  const [mnemonic, setMnemonic] = useState("");
  const [wallets, setWallets] = useState<any[]>([]); // Array to hold all generated wallets

  // FUNCTION 1: Generate the Seed Phrase
  const handleGenerateMnemonic = () => {
    const mn = generateMnemonic();
    setMnemonic(mn);
  };

  // FUNCTION 2: Add a new Wallet (Step 3 Logic)
  const addWallet = () => {
    if (!mnemonic) {
      alert("Please generate a seed phrase first!");
      return;
    }

    // 1. Convert the Mnemonic words -> Seed (Binary)
    const seed = mnemonicToSeedSync(mnemonic);

    // 2. Define the path. We use 'wallets.length' as the index.
    // First wallet is index 0, Second is index 1, etc.
    const path = `m/44'/501'/${wallets.length}'/0'`;

    // 3. Derive the specific private key for this path
    // .toString("hex") converts the binary seed to a text format the library understands
    const derivedSeed = derivePath(path, seed.toString("hex")).key;

    // 4. Create the Solana Keypair from the derived seed
    // nacl (TweetNaCl) handles the cryptography math
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    
    // 5. Generate the Keypair object (contains Public and Secret keys)
    const keypair = Keypair.fromSecretKey(secret);

    // 6. Save this new wallet to our state array
    setWallets([
      ...wallets, 
      {
        publicKey: keypair.publicKey.toBase58(),
        privateKey: bs58.encode(secret)
      }
    ]);
  };

  return (
    <div className="p-10 flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Solana Web Wallet</h1>

      {/* Button to Generate Seed */}
      <button 
        onClick={handleGenerateMnemonic} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Create Seed Phrase
      </button>

      {/* Display Seed Phrase if it exists */}
      {mnemonic && (
        <div className="bg-gray-100 p-4 border rounded w-full break-words">
          <h3 className="font-bold mb-2">Your Seed Phrase:</h3>
          <p className="tracking-widest">{mnemonic}</p>
        </div>
      )}

      {/* Button to Add Wallet */}
      {mnemonic && (
        <button 
          onClick={addWallet} 
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Add Solana Wallet
        </button>
      )}

      {/* Display Generated Wallets */}
      <div className="w-full mt-4">
        {wallets.map((wallet, index) => (
          <div key={index} className="border p-4 mb-4 rounded shadow-sm bg-white">
            <h3 className="text-xl font-bold mb-2">Wallet {index + 1}</h3>
            <div className="bg-gray-50 p-2 rounded mb-2 overflow-hidden">
              <p className="text-sm text-gray-500">Public Key</p>
              <p className="font-mono break-all">{wallet.publicKey}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded overflow-hidden">
              <p className="text-sm text-gray-500">Private Key</p>
              <p className="font-mono break-all text-red-500">{wallet.privateKey}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}