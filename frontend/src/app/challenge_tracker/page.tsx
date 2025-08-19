"use client";
import { useEffect, useState } from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { CHALLANGE_PROGRAM_ID } from "@/constant";
import Link from "next/link";
import idl from "@/constant/challange.json"
import { AnchorProvider, Program, Idl, BN } from "@coral-xyz/anchor";


export default function Tracker() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [hasProfile, setHasProfile] = useState<boolean | null>(false);
  const [challenges, setChallenges] = useState<any[]>([]);
  const challengeOptions = [
    { label: "One Week Hard Challenge", value: { oneWeek: {} }, id: 1 },
    { label: "One Month Hard Challenge", value: { oneMonth: {} }, id: 2 },
    { label: "Two Months Hard Challenge", value: { twoMonths: {} }, id: 3 },
    { label: "Six Months Hard Challenge", value: { sixMonths: {} }, id: 4 },
    { label: "One Year Hard Challenge", value: { oneYear: {} }, id: 5 },
    { label: "75 Hard Challenge", value: { seventyFiveHard: {} }, id: 6 },
  ];
  const [selectedChallenge, setSelectedChallenge] = useState(challengeOptions[0]);
  const fetchChallenges = async () => {
    const program = await getProgram();
    if (!program || !wallet.publicKey) return;
    const userPda = await getUserPda();
    const accountInfo = await program.account.userProfile.fetch(userPda);
    console.log(accountInfo, "accoubnt")
    const totalChalanges = accountInfo?.challenges.length;
    var _challenges = [];
    if (totalChalanges > 0) {
      for (var i = 0; i < totalChalanges; i++) {
        let challangeData = await program.account.challenge.fetch(accountInfo?.challenges[0]);
        let _x = {
          challengeId: challangeData.challengeId.toString(), // BN → string
          challengeType: Object.keys(challangeData.challengeType)[0], // Enum → name
          completed: challangeData.completed,
          currentDay: challangeData.currentDay,
          owner: new PublicKey(challangeData.owner).toBase58(), // PubKey → base58
          totalDays: challangeData.totalDays,
        }
        _challenges.push(_x);
      }

    }
    setChallenges(_challenges);
    return _challenges;
  };
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


  const getUserPda = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }
    const [userPda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("user_profile"),
        wallet.publicKey.toBuffer()
      ],
      CHALLANGE_PROGRAM_ID
    );
    return userPda;
  }

  const getChallengePda = async (id: number) => {
    if (!wallet.publicKey) {
      return null;
    }

    const [challengePda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("challenge"),
        wallet.publicKey.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8), // ✅ correct format
      ],
      CHALLANGE_PROGRAM_ID
    );

    return challengePda;
  };




  useEffect(() => {
    const checkProfile = async () => {
      if (!wallet.publicKey) return;
      try {
        const program = await getProgram();
        if (!program) return;
        const userPda = await getUserPda();
        const accountInfo = await program.account.userProfile.fetch(userPda);
        if (!accountInfo?.owner) {
          console.log("PDA not initialized. Initializing now...");
          setHasProfile(false);
          return;
        }
        await fetchChallenges();
        setHasProfile(true);
      } catch (err) {
        console.log("No user profile found");
        setHasProfile(false);
      }
    };

    checkProfile();
  }, [wallet.publicKey, connection]);

  if (!hasProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1a1a1a] text-white">
        <div className="p-6 rounded-xl bg-[#2a2a2a] shadow-lg text-center">
          <div className='m-2 mb-4'> <WalletMultiButton /></div>
          <h2 className="text-2xl font-semibold mb-4">No Profile Found</h2>
          <p className="mb-4">You need to create a profile before starting challenges.</p>
          <button
            onClick={async () => {
              const program = await getProgram();
              if (!program) return;
              const userPda = await getUserPda();
              await program.methods.initialize()
                .accounts({
                  userProfile: userPda,
                  owner: wallet.publicKey,
                  systemProgram: SystemProgram.programId,
                })
                .rpc();
              setHasProfile(true);
            }}
            className="px-6 py-3 bg-amber-300 cursor-pointer text-black font-bold rounded-lg hover:bg-amber-400 transition"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  if (hasProfile) {
    return (<div className="flex min-h-screen bg-[#1a1a1a] text-white">
      {/* Left Side - Create Challenge */}
      <div className="w-2/3 flex items-center justify-center p-6">
        <div className="p-6 rounded-xl bg-[#2a2a2a] shadow-lg text-center w-full max-w-md">
          <div className="m-2 mb-4">
            <WalletMultiButton />
          </div>
          <h2 className="text-2xl font-semibold mb-4">Create a Challenge</h2>
          <p className="mb-4">Start your journey by selecting a challenge type.</p>

          {/* Dropdown for selecting challenge type */}
          <div className="flex flex-col gap-4">
            <select
              className="mb-4 p-3 rounded-lg bg-[#3a3a3a] text-white border-none focus:ring-2 focus:ring-amber-300"
              value={selectedChallenge.id}
              onChange={(e) => {
                const chosen = challengeOptions.find(
                  (opt) => opt.id === Number(e.target.value)
                );
                if (chosen) setSelectedChallenge(chosen);
              }}
            >
              {challengeOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={async () => {
                const program = await getProgram();
                if (!program) return;
                const userPda = await getUserPda();

                await program.methods
                  .startChallenge(new BN(selectedChallenge.id), selectedChallenge.value)
                  .accounts({
                    owner: wallet.publicKey,
                    challenge: await getChallengePda(selectedChallenge.id),
                    userAccount: userPda,
                    systemProgram: SystemProgram.programId,
                  })
                  .rpc();

                const updated = await fetchChallenges();
                setChallenges(updated);
              }}
              className="px-6 py-3 bg-amber-300 cursor-pointer text-black font-bold rounded-lg hover:bg-amber-400 transition"
            >
              Create {selectedChallenge.label}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Challenge List */}
      <div className="w-1/3 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">Your Challenges</h2>
        {challenges.length === 0 ? (
          <p className="text-gray-400 text-center">
            No challenges yet. Create one to get started!
          </p>
        ) : (
          <ul className="space-y-4">
            {challenges.map((challenge, idx) => (
              <Link
                key={idx}
                href={`/challenge_tracker/${challenge.challengeId.toString()}`}
              >
                <li className="group p-5 bg-gradient-to-br from-[#2d2d2d] to-[#1f1f1f] rounded-2xl shadow-md border border-gray-700 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-gray-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold uppercase text-lg text-yellow-400 group-hover:text-blue-400 transition">
                      {challenge.challengeType} Hard Challenge
                    </span>
                    <span className="text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-400">
                      #{challenge.challengeId.toString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-300 mb-2">
                    Progress:
                    <span className="ml-1 font-medium text-white">
                      Day {challenge.currentDay} / {challenge.totalDays}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${(challenge.currentDay / challenge.totalDays) * 100}%`,
                      }}
                    ></div>
                  </div>
{/* 
                  <div className="flex items-center gap-2 text-sm mt-4">
                    <span className="text-gray-400">Completed:</span>
                    <span className="font-medium">
                      {challenge.completed ? (
                        <span className="text-green-400">✅ Yes</span>
                      ) : (
                        <span className="text-red-400">❌ No</span>
                      )}
                    </span>
                  </div> */}
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>

    </div>);
  }

}