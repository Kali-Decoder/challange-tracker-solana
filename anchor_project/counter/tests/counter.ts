import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import { expect } from "chai";
const web3 = anchor.web3;
describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Counter as Program<Counter>;
  const user = (provider.wallet as anchor.Wallet).payer;
  const someRandomGuy = anchor.web3.Keypair.generate();


  before(async () => {
    const balance = await provider.connection.getBalance(user.publicKey);
    const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSOL);
    console.log(`Balance: ${formattedBalance} SOL`);
  });


  it("Initialize counter for user", async () => {
     let counterPda = await getCounterPDA(user,program.programId);
    await program.methods.initializeCounter()
    .accounts({
      payer: user.publicKey,
      counterAccount: counterPda,
      systemProgram: anchor.web3.SystemProgram.programId
    })
    .signers([user])
    .rpc();
  });

  it("Increment Counter for Particular User",async ()=>{
    let counterPda = await getCounterPDA(user,program.programId);
     const counterBefore = await program.account.counter.fetch(counterPda);
  console.log("Before Increment:", counterBefore.count.toNumber());
    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();

    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();


    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();

    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();

    const counterAfter = await program.account.counter.fetch(counterPda);
    console.log("After Increment:", counterAfter.count.toNumber());
    console.log("Total Increments:", counterAfter.totalIncrements.toNumber());
    expect(counterAfter.count.toNumber()).to.equal(counterBefore.count.toNumber() + 4);
  })

  it("Reset Counter for Particular User", async () => {
    const counterPda = await getCounterPDA(user, program.programId);
  
    const counterBefore = await program.account.counter.fetch(counterPda);
    console.log("Before:", counterBefore.count.toNumber(), counterBefore.totalIncrements.toNumber());
  
    // Increment twice
    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();
  
    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();
  
    // Reset
    await program.methods.resetCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();
  
    // Increment twice again
    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();
  
    await program.methods.incrementCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();
  
    // Reset again
    await program.methods.resetCounter().accounts({
      payer: user.publicKey,
      counterAccount: counterPda
    }).signers([user]).rpc();
  
    const counterAfter = await program.account.counter.fetch(counterPda);
    console.log("After:", counterAfter.count.toNumber(), counterAfter.totalIncrements.toNumber());
  
    expect(counterAfter.count.toNumber()).to.equal(0);
    expect(counterAfter.totalIncrements.toNumber())
      .to.equal(counterBefore.totalIncrements.toNumber() + 4);
  });
  
});

const getCounterPDA=(user,programID)=>{
  const [counterPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("counter_account"),
      user.publicKey.toBuffer()
    ],
    programID
  ); 

  return counterPda;
}



