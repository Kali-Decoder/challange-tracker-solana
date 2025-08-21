use anchor_lang::prelude::*;
use crate::{
    error::TicketRegistryError,state::state::{
        Event,MAX_NAME_LEN,MAX_DESCRIPTION_LEN
    }
};
pub fn _initialize_event(
    ctx: Context<InitializeEvent>,
    name: String,
    desc: String,
    ticket_price: u64,
    total_tickets: u64,
    start_date: i64,
) -> Result<()> {
    let event = &mut ctx.accounts.event;
    require!(
        name.len()<MAX_NAME_LEN,
        TicketRegistryError::NameTooLong
    );

    require!(
        desc.len()<MAX_DESCRIPTION_LEN,
        TicketRegistryError::DescriptionTooLong
    );

    event.name= name;
    event.desc = desc;

    require!(
        total_tickets > 0,
        TicketRegistryError::AvailableTicketsTooLow
    );

    event.start_date = start_date;
    event.total_tickets = total_tickets;
    event.ticket_price = ticket_price;
    event.event_organizer = ctx.accounts.owner.key();
    Ok(())
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeEvent<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer=owner,
        space= 8 + Event::INIT_SPACE,
        seeds=[b"event".as_ref(),name.as_bytes(),owner.key().as_ref()],
        bump,
    )]
    pub event: Account<'info, Event>,
    pub system_program: Program<'info, System>,
}
