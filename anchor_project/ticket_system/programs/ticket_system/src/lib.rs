pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("5dm6uPQpGxKPyFNTFpsUncyBGenyoVCAFPWN68LdEF72");

#[program]
pub mod ticket_system {
    use super::*;

    pub fn initialize(ctx: Context<InitializeEvent>,   
        name: String,
        desc: String,
        ticket_price: u64,
        total_tickets: u64,
        start_date: i64) -> Result<()> {
        _initialize_event(ctx,name,desc,ticket_price,total_tickets,start_date)
    }
    pub fn buy_ticket(ctx:Context<ContextBuy>,tickets_buy:u64) -> Result<()> {
        _buy_ticket(ctx,tickets_buy)
    }
    pub fn withdraw(ctx:Context<WithdrawContext>) -> Result<()> {
        _withdraw(ctx)
    }
}
