"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { PROGRAM_ID } from "@/constant";
import idl from "@/constant/idl.json"
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";

export default function Home() {
  const [balance, setBalance] = useState(0);
  const { connection } = useConnection();
  const wallet = useWallet();
  const [count, setCount] = useState(0);
  const [increments, setIncrements] = useState(0);
  const [loading,setLoading] = useState(false);

  const getProgram = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {

      return null;
    }
    const provider = new AnchorProvider(
      connection,
      wallet as unknown as AnchorProvider["wallet"],
      {}
    );
    return new Program(idl as Idl, provider);
  };

  const getCounterAddress = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }

    const [counterPda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("counter_account"),
        wallet.publicKey.toBuffer()
      ],
      PROGRAM_ID
    );
    return counterPda;
  }

  const loadUserCounterData = async () => {
    setLoading(true);
    const program = await getProgram();
    const pdaAddress = await getCounterAddress();

    if (!program || !pdaAddress) {
      console.error("Wallet or program not ready");
      return;
    }

    // Check if the PDA exists
    const accountInfo = await connection.getAccountInfo(pdaAddress);
    if (!accountInfo) {
      console.log("PDA not initialized. Initializing now...");
      await initializeCounter();
    }

    // Now fetch data
    const counterData = await program.account.counter.fetch(pdaAddress);
    console.log(
      "Count:",
      counterData.count.toNumber(),
      "Total increments:",
      counterData.totalIncrements.toNumber()
    );

    setCount(counterData.count.toNumber());
    setIncrements(counterData.totalIncrements.toNumber());
    setLoading(false);
  };
  const initializeCounter = async () => {
    const program = await getProgram();
    const pdaAddress = await getCounterAddress();

    if (!program || !pdaAddress) {
      console.error("Wallet or program not ready");
      return;
    }

    console.log("Initializing counter at:", pdaAddress.toBase58());

    await program.methods
      .initializeCounter()
      .accounts({
        payer: wallet.publicKey,
        counterAccount: pdaAddress,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Counter initialized");
  };

  const incrementCounter = async () => {
    const program = await getProgram();
    const pdaAddress = await getCounterAddress();

    if (!program || !pdaAddress) {
      console.error("Wallet or program not ready");
      return;
    }

    await program.methods
      .incrementCounter()
      .accounts({
        payer: wallet.publicKey,
        counterAccount: pdaAddress
      })
      .rpc();

    await loadUserCounterData();
  }

  const resetCounter = async () => {
    const program = await getProgram();
    const pdaAddress = await getCounterAddress();

    if (!program || !pdaAddress) {
      console.error("Wallet or program not ready");
      return;
    }

    await program.methods
      .resetCounter()
      .accounts({
        payer: wallet.publicKey,
        counterAccount: pdaAddress
      })
      .rpc();
    await loadUserCounterData();


  }

  useEffect(() => {
    if (!connection || !wallet.publicKey) {
      return;
    }
    connection.onAccountChange(
      wallet.publicKey,
      updatedAccountInfo => {
        setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL)
      },
      "confirmed",
    );


    connection.getAccountInfo(wallet.publicKey).then(info => {
      setBalance(info.lamports);
    });
  }, [connection, wallet?.publicKey]);


  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      loadUserCounterData();
    }
  }, [wallet?.connected, wallet?.publicKey?.toBase58()]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

        <ol className="font-mono list-inside list-decimal text-2xl text-center sm:text-left">
          {wallet?.publicKey ? <> <li className="tracking-[-.01em]">
            Pubkey :
            <code className="bg-black/[.05] dark:bg-white/[.06] text-teal-500 font-mono text-md font-semibold px-1 py-0.5 rounded">
              {wallet?.publicKey?.toBase58()}
            </code>
          </li>
            <li className="tracking-[-.01em] mt-2">
              Balance :
              <code className="bg-black/[.05] dark:bg-white/[.06] text-blue-500  font-mono text-md font-semibold px-1 py-0.5 rounded">
                {balance / LAMPORTS_PER_SOL} SOL
              </code>
            </li>
            <li className="tracking-[-.01em] mt-2">
              Total Number of Increments : {" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] text-red-500 font-mono font-semibold px-1 py-0.5 rounded">
                {loading ? "Updating..." : increments}
              </code>
            </li>
            <li className="tracking-[-.01em] mt-2">
              Your Counter Value :
              <code className="bg-black/[.05] dark:bg-white/[.06] text-green-500 font-mono font-semibold px-1 py-0.5 rounded">
              {loading ? "Updating..." : count}
              </code>
            </li></> : <li className="tracking-[-.01em]">
            Connect Wallet First !!!
          </li>}
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <button onClick={incrementCounter}
            className="rounded-full border border-solid border-black/[.08] cursor-pointer dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            Increment
          </button>
          <button onClick={resetCounter}
            className="rounded-full border border-solid border-t-red-400 cursor-pointer dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
          >
            Reset
          </button>
          <WalletMultiButton />
        </div>
      </main>

    </div>
  );
}
