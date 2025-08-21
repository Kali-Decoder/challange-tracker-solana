use anchor_lang::prelude::*;

use crate::{
    error::TicketRegistryError,state::state::{
        Event,MAX_NAME_LEN,MAX_DESCRIPTION_LEN
    }
};

pub fn _withdraw(ctx: Context<WithdrawContext>) -> Result<()> {
    let event = &mut ctx.accounts.event;
    let event_organizer = &mut ctx.accounts.event_organizer;

    require!(
        event_organizer.key() == event.event_organizer,
        TicketRegistryError::YouAreNotOwner
    );

    // Get all lamports in the event account
    let amount = **event.to_account_info().lamports.borrow();

    // Transfer all lamports to the organizer
    **event.to_account_info().lamports.borrow_mut() -= amount;
    **event_organizer.to_account_info().lamports.borrow_mut() += amount;

    Ok(())
}

#[derive(Accounts)]
pub struct WithdrawContext<'info> {
    #[account(mut)]
    pub event_organizer: Signer<'info>,
    #[account(
        mut,
        has_one = event_organizer
    )]
    pub event: Account<'info, Event>,
} 