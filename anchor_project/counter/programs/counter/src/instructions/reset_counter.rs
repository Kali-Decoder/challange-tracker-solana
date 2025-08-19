use anchor_lang::prelude::*;

use crate::{error::ErrorCode, Counter};

pub fn _reset_counter(ctx: Context<ResetCounterContext>) -> Result<()> {
    let counter_account = &mut ctx.accounts.counter_account;
    require_keys_eq!(
        counter_account.owner,
        ctx.accounts.payer.key(),
        ErrorCode::Unauthorized
    );
    counter_account.count=0;
    Ok(())
}


#[derive(Accounts)]
pub struct ResetCounterContext<'info>{
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"counter_account", payer.key().as_ref()],
        bump
    )]
    pub counter_account: Account<'info, Counter>,
}