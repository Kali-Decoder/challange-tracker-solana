import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TicketSystem } from "../target/types/ticket_system";
import { expect } from "chai";
const web3 = anchor.web3;
describe("Ticket System", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TicketSystem as Program<TicketSystem>;
  const user = (provider.wallet as anchor.Wallet).payer;
  const someRandomGuy = anchor.web3.Keypair.generate();
  before(async () => {
    const balance = await provider.connection.getBalance(user.publicKey);
    await airdropSol(web3.LAMPORTS_PER_SOL, provider.connection, someRandomGuy.publicKey, 5);
    const balanceRandomUser = await provider.connection.getBalance(someRandomGuy.publicKey);
    console.log(balanceRandomUser,"Ranodom User");
    const balanceInSOL = balance / web3.LAMPORTS_PER_SOL;
    const formattedBalance = new Intl.NumberFormat().format(balanceInSOL);
    console.log(`Balance: ${formattedBalance} SOL`);
  });

  let name = "Honey Singh Event";
  let desc = "Honey Singh full digital song !!!";
  let ticketPrice = new anchor.BN(10000000); // lamports
  let totalTickets = new anchor.BN(100);

  it("Initialize Event on chain", async () => {
  
  
    // Start date: one day ago
    let startDate = new anchor.BN(Math.floor(Date.now() / 1000) - 24 * 60 * 60); 
  
    let eventPDA = await getEventPda(user, name, program.programId);
  
    await program.methods
      .initialize(
        name,
        desc,
        ticketPrice,
        totalTickets,
        startDate
      )
      .accounts({
        owner: user.publicKey,
        event: eventPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
  
    const event = await program.account.event.fetch(eventPDA);

    expect(event.name).to.equal("Honey Singh Event");
    expect(event.totalTickets.toNumber()).to.equal(100);
  });
  
  it("Buy Tickets for List Event", async () => {
    let eventPDA = await getEventPda(user, name, program.programId);
    let ticketPda = await getTicketPda(eventPDA,someRandomGuy,program.programId);
    await program.methods.buyTicket(new anchor.BN(40)).accounts({
      buyer:someRandomGuy.publicKey,
      ticket:ticketPda,
      event:eventPDA,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).signers([someRandomGuy]).rpc();


    const ticket = await program.account.ticket.fetch(ticketPda);
    const event = await program.account.event.fetch(eventPDA);
    expect(ticket.totalBuyTickets.toNumber()).to.equal(40);
    expect(event.totalTickets.toNumber()).to.eq(60);
  });

  





});

const getEventPda = (user, name, programID) => {
  const [eventPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("event"),
      Buffer.from(name),
      user.publicKey.toBuffer()
    ],
    programID
  );

  return eventPda;
}

const getTicketPda = (eventPda,user, programID) => {
  const [ticketPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("ticket"),
      eventPda.toBuffer(),
      user.publicKey.toBuffer()
    ],
    programID
  );

  return ticketPda;
}

const airdropSol = async (LAMPORTS_PER_SOL, connection, recipient, amountSol: number) => {
  console.log(`Requesting airdrop of ${amountSol} SOL to ${recipient.toBase58()}`);

  // Request airdrop
  const signature = await connection.requestAirdrop(
    recipient,
    amountSol * LAMPORTS_PER_SOL
  );

  // Confirm transaction
  await connection.confirmTransaction(signature, "confirmed");
  console.log(`Airdropped ${amountSol} SOL to ${recipient.toBase58()}`);
};