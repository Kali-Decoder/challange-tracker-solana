"use client";
import { useEffect, useState } from 'react';
import { useParams } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { CHALLANGE_PROGRAM_ID } from "@/constant";
import idl from "@/constant/challange.json"
import { AnchorProvider, Program, Idl, BN } from "@coral-xyz/anchor";
const emojis = [
  '📄', '📅', '💡', '🚀', '💻', '📈', '✅', '✨', '⏰', '📚', '🏃‍♂️', '💪', '💰', '🧘', '🍔', '🎉',
  '❤️', '⭐', '🌈', '🐶', '🐱', '☕', '🧠', '💼', '🏡', '🎶', '🎨', '✈️', '🚗', '💡', '🔥'
];
export default function Page() {
  const { connection } = useConnection();
  const params = useParams();
  const postId =5;
  const { challengeId } = params;
  const wallet = useWallet();
  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState({ title: '', description: '', emoji: '' });
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [currentDay, setCurrentDay] = useState();
  const [totalDays, setTotalDays] = useState();
  const [currentPostId , setCurrentPostId] = useState();
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

  const getTaskPda = async (challengePDA:any, id: number) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      return null;
    }
    const [taskPda] = await PublicKey.findProgramAddressSync(
      [
        Buffer.from("post"),
        challengePDA.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8),
      ],
      CHALLANGE_PROGRAM_ID
    );
    return taskPda;
  }
  const handleAddTask = async () => {
    try {
      if (!wallet.publicKey) return;
       const program = await getProgram();
      if (!program && !challengeId) return;
  
      // Get challenge PDA (assuming you already know challenge id)
      const challengePDA = await getChallengePda(Number(challengeId));
      // Get task PDA
      const taskPDA = await getTaskPda(challengePDA,new BN(Number(currentPostId)+1));
      const currentTime = Math.floor(Date.now() / 1000);
      // Call the program
      await program?.methods
        .uploadPost(
          new BN(challengeId),   // challenge id
          new BN(Number(currentPostId)+1),             // post id
          taskInput.title,                             // string
          taskInput.description,                       // string (make sure spelling matches contract)
          taskInput.emoji,                             // emoji string
          currentTime.toString(),        // timestamp as BN
          new BN(Number(currentDay)+1)                 // day as BN
        )
        .accounts({
          owner: wallet.publicKey,
          challenge: challengePDA as any,
          task: taskPDA as any,
          systemProgram: SystemProgram.programId,
        })
        .signers([]) // usually no signers needed if using wallet adapter
        .rpc();

        await fetchPosts();
  
      console.log("✅ Task uploaded successfully!");
    } catch (err) {
      console.error("❌ Error uploading task:", err);
    }
  };
  




  // Function to handle emoji selection
  const handleEmojiSelect = (emoji:any) => {
    setTaskInput({ ...taskInput, emoji });
    setIsEmojiPickerOpen(false);
  };
  const fetchPosts = async () => {
    if (!wallet.publicKey) return;
    const program = await getProgram();
    if (!program && !challengeId) return;

    const challengePDA = await getChallengePda(Number(challengeId));
    const challengeAccount = await program?.account.challenge.fetch(challengePDA);
    console.log(challengeAccount, "challengeAccount");
    setCurrentDay(challengeAccount.currentDay);
    setTotalDays(challengeAccount.totalDays);
    let totalPosts = challengeAccount.posts.length;
    setCurrentPostId(totalPosts);
    let fetched: any[] = [];
    if (totalPosts > 0) {
      for (let postId = 0; postId < totalPosts; postId++) {
        try {
          const postAcc: any = await program?.account.task.fetch(challengeAccount.posts[postId]);
          fetched.push({
            id: postAcc.postId.toNumber(),
            title: postAcc.title,
            description: postAcc.discription,
            emoji: postAcc.emoji,
            createdAt: new Date(Number(postAcc.currentTime) * 1000),
          });
        } catch (err) {
          console.log(`Post ${postId} not found`);
        }
      }
    }
    setTodos(fetched);
  };

  useEffect(() => {
    fetchPosts();
  }, [wallet.publicKey, challengeId]);

  return (
    <div className="font-sans text-white bg-[#1a1a1a] p-8 sm:p-12 min-h-screen">
      <div className='m-2'> <WalletMultiButton /></div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3 flex flex-col p-6 rounded-lg bg-[#2a2a2a] shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">Task Tracker</h2>
          <div className="flex flex-col gap-2 mb-4 relative">
            <input
              type="text"
              className="p-3 rounded-lg bg-[#3a3a3a] text-white border-none focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors"
              placeholder="Task Title..."
              value={taskInput.title}
              onChange={(e) => setTaskInput({ ...taskInput, title: e.target.value })}
            />
            <textarea
              className="p-3 rounded-lg bg-[#3a3a3a] text-white border-none focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors h-24 resize-none"
              placeholder="Task Description..."
              value={taskInput.description}
              onChange={(e) => setTaskInput({ ...taskInput, description: e.target.value })}
            />
            {/* Emoji Input and Selector Trigger */}
            <div className="relative">
              <input
                type="text"
                className="p-3 w-[80px] text-center rounded-lg bg-[#3a3a3a] text-white border-none focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors"
                placeholder="🚀"
                value={taskInput.emoji}
                onChange={(e) => setTaskInput({ ...taskInput, emoji: e.target.value })}
                onFocus={() => setIsEmojiPickerOpen(true)}
              />
              {/* The emoji picker dropdown */}
              {isEmojiPickerOpen && (
                <div
                  className="absolute z-10 top-full mt-2 w-full bg-[#3a3a3a] rounded-lg shadow-xl p-3 grid grid-cols-8 gap-1 overflow-y-auto max-h-48"
                  onBlur={() => setTimeout(() => setIsEmojiPickerOpen(false), 100)} // Delay closing to allow clicks

                >
                  {emojis.map((emoji) => (
                    <span
                      key={emoji}
                      className="text-xl cursor-pointer p-1 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAddTask}
              className="px-6 py-3 mt-2 bg-amber-300 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>

        {/* Middle All Posts/To-Do List Component */}
        <div className="w-full md:w-1/3 flex flex-col p-6 h-[40%] overflow-y-scroll rounded-lg bg-[#2a2a2a] shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">All Posts</h2>
          <ul className="space-y-3 flex-grow overflow-y-auto pr-2">
            {todos.map((todo) => (
              <li
                key={todo?.id}
                className="flex items-center p-4 rounded-lg bg-[#3a3a3a] transition-all duration-200 hover:bg-[#4a4a4a]"
              >
                {/* Emoji */}
                <span className="text-2xl mr-4">{todo?.emoji}</span>

                {/* Content */}
                <div className="flex-grow">
                  <div className="font-semibold text-white">{todo?.title}</div>
                  <div className="text-sm text-gray-400">{todo?.description}</div>
                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mt-1">
                    Added: {todo?.createdAt.toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>


        {/* Right-side Calendar Component */}
        <div className="w-full md:w-1/3 flex flex-col p-6 rounded-lg bg-[#2a2a2a] shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
            Challenge Tracker
          </h2>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-sm sm:text-base">
            {Array.from({ length: totalDays }, (_, i) => {
              const day = i + 1;

              let boxColor = "bg-gray-700"; // default future (gray)
              if (day < currentDay) boxColor = "bg-green-500 text-white font-bold"; // completed
              if (day === currentDay) boxColor = "bg-red-500 text-white font-bold"; // current

              return (
                <div
                  key={day}
                  className={`py-2 sm:py-3 rounded-lg ${boxColor}`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}