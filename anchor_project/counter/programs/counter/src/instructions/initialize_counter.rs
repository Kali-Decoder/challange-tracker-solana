use anchor_lang::prelude::*;

use crate::Counter;

pub fn _initialize_counter(ctx: Context<InitializeCounter>) -> Result<()> {
    let counter_account = &mut ctx.accounts.counter_account;
    counter_account.count=0;
    counter_account.owner = *ctx.accounts.payer.key;
    counter_account.total_increments=0;
    counter_account.created_at =  Clock::get()?.unix_timestamp ;
    Ok(())
}


#[derive(Accounts)]
pub struct InitializeCounter<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer=payer,
        space= 8 + Counter::INIT_SPACE,
        seeds=[b"counter_account".as_ref(),payer.key().as_ref()],
        bump
    )]
    pub counter_account : Account<'info,Counter>,
    pub system_program : Program<'info,System>
}